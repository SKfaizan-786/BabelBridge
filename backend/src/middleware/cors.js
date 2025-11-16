/**
 * CORS Middleware Configuration
 * Handles cross-origin requests for the chat widget
 */

import cors from 'cors';
import config from '../config/env.js';

/**
 * CORS options for Express
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (config.allowedOrigins.includes(origin) || config.allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Express CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Socket.IO CORS configuration
 */
export const socketCorsOptions = {
  origin: config.allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
};
