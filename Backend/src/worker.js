import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection, QUEUE_NAME } from './config/queue.js';
import { s3Client, BUCKET_NAME } from './config/s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { extractTextFromResumeBuffer } from './utils/fileExtractor.js';
import { generateJson, embedText } from './utils/gemini.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { getIO } from './config/socket.js';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

const prisma = new PrismaClient();

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const optionalNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeFeedback = (feedback) => ({
  score: clampScore(feedback?.score),
  summary: typeof feedback?.summary === 'string' ? feedback.summary : '',
  strengths: Array.isArray(feedback?.strengths) ? feedback.strengths : [],
  weaknesses: Array.isArray(feedback?.weaknesses) ? feedback.weaknesses : [],
  improvementSuggestions: Array.isArray(feedback?.improvementSuggestions) ? feedback.improvementSuggestions : [],
  bulletPointRewrites: Array.isArray(feedback?.bulletPointRewrites) ? feedback.bulletPointRewrites.map((rewrite) => ({
    before: rewrite?.before || '',
    after: rewrite?.after || '',
    explanation: rewrite?.explanation || '',
  })).filter((rewrite) => rewrite.before || rewrite.after) : [],
  interviewQuestions: Array.isArray(feedback?.interviewQuestions) ? feedback.interviewQuestions : [],
  atsAnalysis: {
    score: clampScore(feedback?.atsAnalysis?.score),
    issues: Array.isArray(feedback?.atsAnalysis?.issues) ? feedback.atsAnalysis.issues : [],
    missingKeywords: Array.isArray(feedback?.atsAnalysis?.missingKeywords) ? feedback.atsAnalysis.missingKeywords : [],
    formatWarnings: Array.isArray(feedback?.atsAnalysis?.formatWarnings) ? feedback.atsAnalysis.formatWarnings : [],
  },
  careerProfile: {
    headline: typeof feedback?.careerProfile?.headline === 'string' ? feedback.careerProfile.headline : '',
    targetRoles: Array.isArray(feedback?.careerProfile?.targetRoles) ? feedback.careerProfile.targetRoles.slice(0, 5) : [],
    skills: Array.isArray(feedback?.careerProfile?.skills) ? feedback.careerProfile.skills.slice(0, 40) : [],
    seniority: typeof feedback?.careerProfile?.seniority === 'string' ? feedback.careerProfile.seniority : '',
    yearsExperience: optionalNumber(feedback?.careerProfile?.yearsExperience),
    location: typeof feedback?.careerProfile?.location === 'string' ? feedback.careerProfile.location : '',
  },
});

const buildAnalysisPrompt = (resumeText, jobDescription) => `
You are CareerOS, a careful resume evidence analyst. Analyze only what the candidate's resume actually supports.

RESUME:
${resumeText}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : 'No target job description was supplied. Evaluate resume quality and infer realistic target roles from demonstrated experience.'}

Return ONLY valid JSON with exactly this shape:
{
  "score": 0,
  "summary": "",
  "strengths": [""],
  "weaknesses": [""],
  "improvementSuggestions": [""],
  "bulletPointRewrites": [
    { "before": "", "after": "", "explanation": "" }
  ],
  "interviewQuestions": [""],
  "atsAnalysis": {
    "score": 0,
    "issues": [""],
    "missingKeywords": [""],
    "formatWarnings": [""]
  },
  "careerProfile": {
    "headline": "",
    "targetRoles": [""],
    "skills": [""],
    "seniority": "",
    "yearsExperience": null,
    "location": ""
  }
}

Rules:
- Never invent employers, projects, degrees, skills, metrics, dates, certifications, responsibilities, or outcomes.
- score and atsAnalysis.score must be integers from 0 to 100 and must reflect evidence in this document, not encouragement.
- careerProfile must contain only facts or conservative inferences supported by the resume.
- targetRoles should be 1-5 realistic job titles suggested by demonstrated work, strongest first.
- skills should contain concise searchable skill names that are actually evidenced by the resume.
- yearsExperience must be null when dates do not support a defensible estimate.
- For rewrites, do not fabricate numbers. If a missing metric would improve a bullet, use an explicit placeholder such as [X%] or [N users].
- If no job description is supplied, atsAnalysis.missingKeywords must be [] and interviewQuestions should test the candidate's demonstrated work rather than imaginary gaps.
- If a job description is supplied, missingKeywords and interviewQuestions may reference its requirements, but distinguish missing evidence from proven absence.
- Keep arrays concise and useful. Avoid generic motivational language.
`;

const worker = new Worker(QUEUE_NAME, async (job) => {
  const { jobId, jobDescription = '' } = job.data;
  console.log(`[Worker] Started processing job: ${jobId}`);

  try {
    const dbJob = await prisma.analysisJob.findUnique({ where: { id: jobId } });
    if (!dbJob) throw new Error(`Job ${jobId} not found in database`);

    try { getIO().to(jobId).emit('job-update', { status: 'PARSING' }); } catch {}
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'PARSING' } });

    const s3Key = dbJob.resumeUrl.split('/').slice(-1)[0];
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: `resumes/${s3Key}` });
    const s3Response = await s3Client.send(command);
    const fileBuffer = Buffer.from(await s3Response.Body.transformToByteArray());
    const resumeText = await extractTextFromResumeBuffer(fileBuffer);

    if (!resumeText || resumeText.trim().length < 40) {
      throw new Error('The uploaded resume did not contain enough readable text to analyze.');
    }

    try { getIO().to(jobId).emit('job-update', { status: 'ANALYZING' }); } catch {}
    await prisma.analysisJob.update({ where: { id: jobId }, data: { status: 'ANALYZING' } });

    const contentHash = crypto.createHash('sha256').update(resumeText + jobDescription).digest('hex');
    const cacheKey = `resume_cache:v2:${contentHash}`;
    const cachedResult = await redisConnection.get(cacheKey);

    let finalFeedbackJson;
    if (cachedResult) {
      console.log(`[Worker] Job ${jobId}: cache hit`);
      finalFeedbackJson = normalizeFeedback(JSON.parse(cachedResult));
    } else {
      console.log(`[Worker] Job ${jobId}: generating evidence-based resume analysis`);
      const generated = await generateJson(buildAnalysisPrompt(resumeText, jobDescription));
      finalFeedbackJson = normalizeFeedback(generated);
      await redisConnection.set(cacheKey, JSON.stringify(finalFeedbackJson), 'EX', 7 * 24 * 60 * 60);
    }

    let matchScore = null;
    if (jobDescription.trim().length > 10) {
      console.log(`[Worker] Job ${jobId}: generating semantic match embeddings`);
      try {
        const jdVector = await embedText(jobDescription);
        const jdVectorString = `[${jdVector.join(',')}]`;

        await prisma.$executeRawUnsafe(
          `UPDATE "AnalysisJob" SET "jdEmbedding" = $1::vector WHERE id = $2`,
          jdVectorString,
          jobId
        );

        const chunks = resumeText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter((line) => line.length > 20)
          .slice(0, 80);

        for (const chunk of chunks) {
          const chunkVector = await embedText(chunk);
          const chunkVectorString = `[${chunkVector.join(',')}]`;
          await prisma.$executeRawUnsafe(
            `INSERT INTO "ResumeEmbedding" (id, "jobId", content, embedding) VALUES ($1, $2, $3, $4::vector)`,
            crypto.randomUUID(),
            jobId,
            chunk,
            chunkVectorString
          );
        }

        const queryResult = await prisma.$queryRawUnsafe(`
          SELECT AVG(1 - (embedding <=> $1::vector)) as avg_similarity
          FROM "ResumeEmbedding"
          WHERE "jobId" = $2
        `, jdVectorString, jobId);

        if (queryResult?.[0]?.avg_similarity != null) {
          matchScore = Math.max(0, Math.min(100, parseFloat(queryResult[0].avg_similarity) * 100));
          console.log(`[Worker] Job ${jobId}: semantic similarity ${matchScore.toFixed(1)}%`);
        }
      } catch (embeddingError) {
        console.error(`[Worker] Semantic matching failed for ${jobId}; report will still complete.`, embeddingError);
      }
    }

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        feedback: finalFeedbackJson,
        matchScore,
      },
    });

    console.log(`[Worker] Job ${jobId} completed successfully`);
    try { getIO().to(jobId).emit('job-update', { status: 'COMPLETED' }); } catch {}
  } catch (error) {
    Sentry.captureException(error, { tags: { jobId } });
    console.error(`[Worker Error] Failed job ${jobId}:`, error);
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FAILED' },
    }).catch((updateError) => console.error('Failed to update DB to FAILED status', updateError));
    try { getIO().to(jobId).emit('job-update', { status: 'FAILED', error: error.message }); } catch {}
    throw error;
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  console.log(`[BullMQ] Job ${job?.id} failed with error: ${err.message}`);
});

export default worker;
