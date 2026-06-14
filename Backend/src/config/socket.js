import { Server } from 'socket.io';

// We export the io instance as null initially.
// It gets initialized in index.js with the real HTTP server.
// Exporting it this way avoids circular import issues when the Worker
// needs to import 'io' to emit events back to the frontend.
let io = null;

/**
 * Initializes the Socket.io server and attaches it to the existing HTTP server.
 * This is called ONCE in index.js when the server starts up.
 * 
 * @param {import('http').Server} httpServer - The raw Node.js HTTP server
 * @param {string[]} allowedOrigins - Array of allowed CORS origins
 */
export const initSocket = (httpServer, allowedOrigins) => {

  io = new Server(httpServer, {
    // Socket.io has its own CORS config separate from Express CORS middleware.
    // Without this, the browser will block WebSocket connections.
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // This event fires every time a NEW client (browser tab) connects via WebSocket.
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // When the Frontend sends a 'subscribe-to-job' event with a jobId,
    // we put that socket into a "Room" named after the jobId.
    // This is the KEY pattern: each job gets its own private broadcast channel.
    // The Worker will later emit events to this room when the job progresses.
    socket.on('subscribe-to-job', (jobId) => {
      socket.join(jobId); // Join the room for this specific job
      console.log(`[Socket.io] Client ${socket.id} subscribed to job: ${jobId}`);
    });

    // Clean up log when user closes the tab or disconnects
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket.io] WebSocket server initialized successfully.');
  return io;
};

/**
 * Returns the active Socket.io instance.
 * This can be imported in any other file (like the Worker) to emit events.
 * Throws an error if called before initSocket() has been run.
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket() first.');
  }
  return io;
};
