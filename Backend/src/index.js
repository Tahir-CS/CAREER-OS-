import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import resumeRoutes from './routes/resume.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import { initSocket } from './config/socket.js';
import { redisConnection, analysisQueue } from './config/queue.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

initSocket(httpServer, allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
  }),
  message: { success: false, message: 'Too many analyses requested from this IP. Please try again after an hour.' },
});

const discoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: 'career_os_job_discovery_rl:',
  }),
  message: { success: false, message: 'Too many job searches. Please try again shortly.' },
});

app.use('/api/upload-resume', analysisLimiter);
app.use('/api/jobs', discoveryLimiter);

app.use('/api', resumeRoutes);
app.use('/api', jobsRoutes);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(analysisQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max size is 5MB.' });
  }
  if (err.message === 'Invalid file type. Only PDF and DOCX files are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }

  Sentry.captureException(err);
  console.error('[Global Error Handler]', err.stack);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Server] CareerOS API running on port ${PORT}`);
  console.log(`[Server] WebSocket server ready on ws://localhost:${PORT}`);
});
