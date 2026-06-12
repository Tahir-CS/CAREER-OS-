import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to our local Redis Docker container
export const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // This is explicitly required by BullMQ to prevent freezing
});

export const QUEUE_NAME = 'resume-analysis-queue';

// This is the Queue where the Express API will push the Job IDs
// The Worker process will pull from this same queue.
export const analysisQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});
