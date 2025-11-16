/**
 * LingoLive Support - Backend Server
 * Real-time multilingual customer support chat backend
 *
 * Main entry point that:
 * - Initializes Express server
 * - Sets up Socket.IO for real-time communication
 * - Registers routes and middleware
 * - Handles widget and agent connections
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import configuration and utilities
import config, { validateConfig } from './src/config/env.js';
import { corsMiddleware, socketCorsOptions } from './src/middleware/cors.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import localesRoutes from './src/routes/locales.js';

// Import socket handlers
import { initializeSocketHandlers } from './src/sockets/index.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration error:', error.message);
  process.exit(1);
}

// ==================== SERVER SETUP ====================

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: socketCorsOptions,
  transports: ['websocket', 'polling'],
});

// ==================== MIDDLEWARE ====================

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.path}`);
  next();
});

// Serve static files (for agent dashboard)
app.use(express.static(join(__dirname, 'public')));

// ==================== ROUTES ====================

// Health check
app.get('/', (req, res) => {
  res.json({
    service: 'LingoLive Support Backend',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', authRoutes);
app.use('/api', localesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// ==================== SOCKET.IO SETUP ====================

initializeSocketHandlers(io);

// ==================== START SERVER ====================

httpServer.listen(config.port, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🌉 BabelBridge - Multilingual Support Chat Backend');
  console.log('='.repeat(70));
  console.log(`📍 Server URL:         http://localhost:${config.port}`);
  console.log(`🌐 Environment:        ${config.nodeEnv}`);
  console.log(`🔑 Valid Site Keys:    ${config.validSiteKeys.join(', ')}`);
  console.log(`🌍 Supported Langs:    ${config.supportedLanguages.join(', ')}`);
  console.log(`🔧 Translation:        LibreTranslate (${config.libreTranslate.url})`);
  console.log(`🎨 UI Localization:    Lingo.dev`);
  console.log(`📡 Socket.IO:          Ready`);
  console.log(`👤 Agent Dashboard:    http://localhost:${config.port}/agent.html`);
  console.log('='.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received, closing server...');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
