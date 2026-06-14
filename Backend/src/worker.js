import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection, QUEUE_NAME } from './config/queue.js';
import { s3Client, BUCKET_NAME } from './config/s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { extractTextFromDOCXBuffer } from './utils/fileExtractor.js'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
// We import our Socket.io instance so we can push real-time updates!
import { getIO } from './config/socket.js';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

// ---------------------------------------------------------------------------
// THE BACKGROUND WORKER
// This runs completely independently of the Express API. It just sits here 
// listening to the Redis queue. When the Express API pushes a Job ID, this
// worker wakes up and does the heavy lifting.
// ---------------------------------------------------------------------------
const worker = new Worker(QUEUE_NAME, async (job) => {
  const { jobId, jobDescription } = job.data;
  console.log(`[Worker] Started processing job: ${jobId}`);

  try {
    // 1. Fetch the Job from PostgreSQL to get the S3 URL
    const dbJob = await prisma.analysisJob.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error(`Job ${jobId} not found in database`);

    // Emit Socket.io event: "We started parsing!"
    // By using .to(jobId), ONLY the specific user who uploaded this exact resume 
    // gets the message. It's a private broadcast room!
    try { getIO().to(jobId).emit('job-update', { status: 'PARSING' }); } catch (e) { /* ignore if socket not ready */ }
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'PARSING' } });

    // 2. Download the file from S3 (MinIO) directly into server RAM (a Buffer)
    const s3Key = dbJob.resumeUrl.split('/').slice(-1)[0]; // Extract filename from the URL
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: `resumes/${s3Key}` });
    const s3Response = await s3Client.send(command);
    const fileBuffer = Buffer.from(await s3Response.Body.transformToByteArray());

    // 3. Extract text from the Buffer
    const resumeText = await extractTextFromDOCXBuffer(fileBuffer);

    // -----------------------------------------------------------------------
    // THE DUAL-AGENT PIPELINE
    // -----------------------------------------------------------------------
    
    // Tell the frontend we are now talking to Gemini
    try { getIO().to(jobId).emit('job-update', { status: 'ANALYZING' }); } catch (e) {}
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'ANALYZING' } });

    console.log(`[Worker] Job ${jobId}: Running Agent 1 (Parser)`);
    // AGENT 1: The Parser & Evaluator
    const agent1Prompt = `You are an expert ATS (Applicant Tracking System) Parser. 
    Extract the key information from this resume text and score its formatting and grammar out of 100.
    Output ONLY JSON.
    Resume: ${resumeText}`;
    
    const agent1Result = await model.generateContent(agent1Prompt);
    const agent1Data = agent1Result.response.text();

    console.log(`[Worker] Job ${jobId}: Running Agent 2 (Synthesis)`);
    // AGENT 2: The Tech & HR Synthesis
    const agent2Prompt = `You are a Senior Tech Lead and HR Manager. 
    Review this resume text, and the ATS parser's findings: ${agent1Data}.
    Write a cohesive final report with key strengths, weaknesses, and 3 bullet point rewrites.
    Compare it against this Job Description if provided: ${jobDescription}.
    Output ONLY valid JSON matching the old Analysis format (score, summary, strengths, weaknesses, improvementSuggestions, bulletPointRewrites).`;

    const agent2Result = await model.generateContent(agent2Prompt);
    
    // Clean up Gemini's markdown formatting so we can parse the JSON safely
    let finalFeedbackText = agent2Result.response.text();
    finalFeedbackText = finalFeedbackText.replace(/```json/g, '').replace(/```/g, '').trim();
    const finalFeedbackJson = JSON.parse(finalFeedbackText);

    // 4. Save Final Result to PostgreSQL
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        feedback: finalFeedbackJson,
        score: finalFeedbackJson.score || 85 // Fallback score if Gemini forgets
      }
    });

    // 5. Emit Final WebSocket Event to tell the Frontend to refresh
    console.log(`[Worker] Job ${jobId} completed successfully!`);
    try { getIO().to(jobId).emit('job-update', { status: 'COMPLETED' }); } catch (e) {}

  } catch (error) {
    // Phase 6 TODO: Send this to Sentry
    console.error(`[Worker Error] Failed job ${jobId}:`, error);
    
    // Mark as failed in DB so we don't try to download an empty PDF later
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' }
    }).catch(e => console.error('Failed to update DB to FAILED status', e));
    
    // Tell the frontend something went wrong
    try { getIO().to(jobId).emit('job-update', { status: 'FAILED', error: error.message }); } catch (e) {}
    
    // Throw error so BullMQ knows the job failed and can retry it if we configure retries
    throw error; 
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  console.log(`[BullMQ] Job ${job?.id} failed with error: ${err.message}`);
});

export default worker;
