import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// We configure the standard AWS S3 Client to point to our local MinIO container!
// When you deploy to production (like Cloudflare R2), you just change these environment variables.
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1', // Region is required by the SDK
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || 'admin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'password123',
  },
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  // forcePathStyle MUST be true for S3-compatible services like MinIO to work properly!
  forcePathStyle: true, 
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'resumes';
