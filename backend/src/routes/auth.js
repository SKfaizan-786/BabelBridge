/**
 * Authentication Routes
 * Handles widget authentication and session creation
 */

import express from 'express';
import { validateSiteKey, generateSessionToken } from '../utils/tokens.js';
import { createSession } from '../store/sessions.js';
import config from '../config/env.js';

const router = express.Router();

// Handle CORS preflight for /auth
router.options('/auth', (req, res) => {
  res.status(200).end();
});

/**
 * GET /auth
 * Authenticates a widget and creates a new session
 *
 * Query params:
 *   - siteKey: Public site key from widget configuration
 *
 * Returns:
 *   - sessionId: Unique session identifier
 *   - sessionToken: JWT for socket authentication
 *   - allowedLanguages: List of supported languages
 */
router.get('/auth', (req, res) => {
  const { siteKey } = req.query;

  // Validate site key is provided
  if (!siteKey) {
    return res.status(400).json({
      error: 'Missing site key',
      message: 'siteKey query parameter is required',
    });
  }

  // Validate site key against configured keys
  if (!validateSiteKey(siteKey)) {
    console.warn(`[Auth] Invalid site key attempted: ${siteKey}`);
    return res.status(401).json({
      error: 'Invalid site key',
      message: 'The provided site key is not authorized',
    });
  }

  try {
    // Create a new session
    const session = createSession(siteKey);

    // Generate session token
    const sessionToken = generateSessionToken(session.sessionId, siteKey);

    console.log(`[Auth] Created session ${session.sessionId} for site key ${siteKey}`);

    // Return session info
    res.json({
      success: true,
      sessionId: session.sessionId,
      sessionToken,
      allowedLanguages: config.supportedLanguages,
      defaultLanguage: config.defaultLanguage,
    });
  } catch (error) {
    console.error('[Auth] Error creating session:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create session',
    });
  }
});

export default router;
