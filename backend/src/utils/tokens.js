/**
 * Token Generation and Validation Utilities
 * Handles JWT creation and verification for session tokens
 */

import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generates a session token (JWT) for a given session
 * @param {string} sessionId - Unique session identifier
 * @param {string} siteKey - Site key from the widget
 * @returns {string} JWT token
 */
export function generateSessionToken(sessionId, siteKey) {
  const payload = {
    sessionId,
    siteKey,
    type: 'session',
    iat: Math.floor(Date.now() / 1000),
  };

  const options = {
    expiresIn: '24h', // Token expires in 24 hours
  };

  return jwt.sign(payload, config.jwtSecret, options);
}

/**
 * Verifies and decodes a session token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
export function verifySessionToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Ensure it's a session token
    if (decoded.type !== 'session') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Validates a site key against configured valid keys
 * @param {string} siteKey - Site key to validate
 * @returns {boolean} True if valid
 */
export function validateSiteKey(siteKey) {
  return config.validSiteKeys.includes(siteKey);
}
