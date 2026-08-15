import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const endpointValue = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const endpoint = /^https?:\/\//i.test(endpointValue)
  ? endpointValue
  : `http://${endpointValue}:${process.env.MINIO_PORT || '9000'}`;

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'password123',
  },
  endpoint,
  forcePathStyle: true,
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'resumes';
