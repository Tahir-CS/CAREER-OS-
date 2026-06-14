import express from 'express';
import { createServer } from 'http'; // Step 1: Import Node's built-in HTTP module
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import resumeRoutes from './routes/resume.routes.js';
import { initSocket } from './config/socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// -------------------------------------------------------------------------
// CRITICAL ARCHITECTURAL CHANGE:
// OLD: app.listen(PORT) → Express creates a hidden internal HTTP server.
//      Socket.io cannot access it. WebSockets are impossible.
//
// NEW: We create our OWN HTTP server by wrapping Express inside it.
//      This gives us a direct reference to the server object.
//      Both Express routes AND Socket.io WebSockets now share port 3001.
// -------------------------------------------------------------------------
const httpServer = createServer(app); // Step 2: Wrap Express in a raw HTTP server

// Allowed CORS origins (same list used for both Express and Socket.io)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

// Step 3: Attach Socket.io to the HTTP server and pass the origins for its own CORS
// After this line, the 'io' instance is alive and ready. The Worker process
// can import getIO() from socket.js to emit real-time events to the frontend.
initSocket(httpServer, allowedOrigins);

// Standard Express middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiter (we will upgrade this to a Redis sliding-window limiter in Phase 4)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' }
});
app.use(limiter);

// REST API Routes
app.use('/api', resumeRoutes);

// Global Express error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Max size is 5MB.' });
  }
  if (err.message === 'Invalid file type. Only PDF and DOCX files are allowed.') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // TODO Phase 6: Replace this with structured Winston logger + Sentry capture
  console.error('[Global Error Handler]', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Step 4: Listen on the HTTP server, NOT on app.
// Listening on 'app' would bypass our Socket.io setup completely.
httpServer.listen(PORT, () => {
  console.log(`[Server] CareerOS API running on port ${PORT}`);
  console.log(`[Server] WebSocket server ready on ws://localhost:${PORT}`);
});
