import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection, QUEUE_NAME } from './config/queue.js';
import { s3Client, BUCKET_NAME } from './config/s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { extractTextFromDOCXBuffer } from './utils/fileExtractor.js'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { getIO } from './config/socket.js';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
// NEW: Load the embedding model for RAG!
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// ---------------------------------------------------------------------------
// THE BACKGROUND WORKER
// ---------------------------------------------------------------------------
const worker = new Worker(QUEUE_NAME, async (job) => {
  const { jobId, jobDescription } = job.data;
  console.log(`[Worker] Started processing job: ${jobId}`);

  try {
    const dbJob = await prisma.analysisJob.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error(`Job ${jobId} not found in database`);

    try { getIO().to(jobId).emit('job-update', { status: 'PARSING' }); } catch (e) {}
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'PARSING' } });

    // Download & Parse
    const s3Key = dbJob.resumeUrl.split('/').slice(-1)[0]; 
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: `resumes/${s3Key}` });
    const s3Response = await s3Client.send(command);
    const fileBuffer = Buffer.from(await s3Response.Body.transformToByteArray());
    const resumeText = await extractTextFromDOCXBuffer(fileBuffer);

    try { getIO().to(jobId).emit('job-update', { status: 'ANALYZING' }); } catch (e) {}
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'ANALYZING' } });

    // -----------------------------------------------------------------------
    // NEW PHASE 4: REDIS CACHING LAYER (COST CONTROL)
    // -----------------------------------------------------------------------
    const contentHash = crypto.createHash('md5').update(resumeText + (jobDescription || '')).digest('hex');
    const cacheKey = `resume_cache:${contentHash}`;
    const cachedResult = await redisConnection.get(cacheKey);

    let finalFeedbackJson;

    if (cachedResult) {
      console.log(`[Worker] Job ${jobId}: CACHE HIT! Skipping Gemini API to save costs.`);
      finalFeedbackJson = JSON.parse(cachedResult);
    } else {
      // -----------------------------------------------------------------------
      // AGENT 1 & 2: Parsing and Synthesis
      // -----------------------------------------------------------------------
      console.log(`[Worker] Job ${jobId}: Running Agent 1 (Parser)`);
      const agent1Prompt = `You are an expert ATS Parser. Extract the key information from this resume text and score its formatting and grammar out of 100. Output ONLY JSON. Resume: ${resumeText}`;
      const agent1Result = await model.generateContent(agent1Prompt);
      const agent1Data = agent1Result.response.text();

      console.log(`[Worker] Job ${jobId}: Running Agent 2 (Synthesis)`);
      const agent2Prompt = `You are a Senior Tech Lead and HR Manager. Review this resume text, and the ATS parser's findings: ${agent1Data}. Write a cohesive final report with key strengths, weaknesses, and 3 bullet point rewrites. Compare it against this Job Description if provided: ${jobDescription}. Output ONLY valid JSON matching the old Analysis format (score, summary, strengths, weaknesses, improvementSuggestions, bulletPointRewrites).`;
      const agent2Result = await model.generateContent(agent2Prompt);
      
      let finalFeedbackText = agent2Result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      finalFeedbackJson = JSON.parse(finalFeedbackText);

      // Save to Redis Cache with a 7-day expiration (TTL)
      await redisConnection.set(cacheKey, JSON.stringify(finalFeedbackJson), 'EX', 7 * 24 * 60 * 60);
    }

    // -----------------------------------------------------------------------
    // NEW PHASE 3: RAG EMBEDDINGS & SEMANTIC MATCHING
    // -----------------------------------------------------------------------
    let matchScore = null;
    
    // Only perform matching if a Job Description was actually provided
    if (jobDescription && jobDescription.trim().length > 10) {
      console.log(`[Worker] Job ${jobId}: Generating Embeddings for Semantic RAG Match`);
      
      try {
        // 1. Embed the Job Description
        const jdEmbeddingResult = await embeddingModel.embedContent(jobDescription);
        const jdVector = jdEmbeddingResult.embedding.values;
        const jdVectorString = `[${jdVector.join(',')}]`; // Convert to pgvector string format
        
        // Save JD vector using raw SQL (Prisma requirement for vector types)
        await prisma.$executeRawUnsafe(
          `UPDATE "AnalysisJob" SET "jdEmbedding" = $1::vector WHERE id = $2`,
          jdVectorString, 
          jobId
        );

        // 2. Chunk the resume into bullet points (naive split by line for now)
        const chunks = resumeText.split('\\n').filter(line => line.trim().length > 15);
        
        // 3. Embed each chunk and save to pgvector database
        for (const chunk of chunks) {
            const chunkResult = await embeddingModel.embedContent(chunk);
            const chunkVector = chunkResult.embedding.values;
            const chunkVectorString = `[${chunkVector.join(',')}]`;
            
            await prisma.$executeRawUnsafe(
                `INSERT INTO "ResumeEmbedding" (id, "jobId", content, embedding) VALUES ($1, $2, $3, $4::vector)`,
                crypto.randomUUID(), jobId, chunk, chunkVectorString
            );
        }

        // 4. Mathematical Cosine Similarity Search
        // The `<=>` operator computes cosine distance (0 = identical, 1 = perfectly opposite).
        // (1 - distance) = semantic similarity. We average the similarity of all resume chunks to the JD.
        const queryResult = await prisma.$queryRawUnsafe(`
            SELECT AVG(1 - (embedding <=> $1::vector)) as avg_similarity
            FROM "ResumeEmbedding"
            WHERE "jobId" = $2
        `, jdVectorString, jobId);

        // Convert the 0.0 - 1.0 similarity into a percentage score!
        if (queryResult && queryResult[0] && queryResult[0].avg_similarity != null) {
          matchScore = parseFloat(queryResult[0].avg_similarity) * 100;
          console.log(`[Worker] Job ${jobId}: RAG Match Score calculated as ${matchScore.toFixed(1)}%`);
        }
      } catch (embeddingError) {
        console.error(`[Worker] RAG Embedding Failed, but continuing...`, embeddingError);
      }
    }

    // -----------------------------------------------------------------------
    // SAVE FINAL DATA
    // -----------------------------------------------------------------------
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        feedback: finalFeedbackJson,
        score: finalFeedbackJson.score || 85,
        matchScore: matchScore // Save our true RAG mathematical score!
      }
    });

    console.log(`[Worker] Job ${jobId} completed successfully!`);
    try { getIO().to(jobId).emit('job-update', { status: 'COMPLETED' }); } catch (e) {}

  } catch (error) {
    console.error(`[Worker Error] Failed job ${jobId}:`, error);
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' }
    }).catch(e => console.error('Failed to update DB to FAILED status', e));
    try { getIO().to(jobId).emit('job-update', { status: 'FAILED', error: error.message }); } catch (e) {}
    throw error; 
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  console.log(`[BullMQ] Job ${job?.id} failed with error: ${err.message}`);
});

export default worker;
