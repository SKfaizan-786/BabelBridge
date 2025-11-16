/**
 * Environment Configuration
 * Centralizes all environment variable access and provides defaults
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Application configuration object
 */
const config = {
  // Server settings
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  validSiteKeys: (process.env.VALID_SITE_KEYS || 'PUBLIC_SITE_KEY_123').split(','),

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:5175,http://127.0.0.1:5173').split(','),

  // Lingo (for UI localization only - build-time tool)
  lingo: {
    apiKey: process.env.LINGO_API_KEY || '',
  },

  // LibreTranslate (for runtime message translation)
  libreTranslate: {
    url: process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate',
    apiKey: process.env.LIBRETRANSLATE_API_KEY || '',
    enabled: true, // Always enabled, falls back to stub if API fails
  },

  // Session configuration
  session: {
    timeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS || '3600000', 10), // 1 hour default
  },

  // Supported languages (en, hi, bn, ta, es, ar, zh)
  supportedLanguages: ['en', 'hi', 'bn', 'ta', 'es', 'ar', 'zh'],
  defaultLanguage: 'en',
  agentLanguage: 'en', // Canonical language for agents
};

/**
 * Validates required configuration
 * @throws {Error} if required config is missing
 */
export function validateConfig() {
  const required = ['jwtSecret'];
  const missing = required.filter(key => !config[key] || config[key] === 'dev-secret-key-change-in-production');

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

export default config;
