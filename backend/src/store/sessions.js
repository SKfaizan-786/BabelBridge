/**
 * In-Memory Session Store
 * Manages chat sessions, messages, and user metadata
 *
 * NOTE: This is an in-memory store for MVP. For production, replace with:
 * - Redis for session management
 * - PostgreSQL/MongoDB for persistent message history
 */

import { v4 as uuidv4 } from 'uuid';

// In-memory data structures
export const sessions = new Map(); // sessionId -> session metadata
export const messages = new Map(); // sessionId -> array of messages
const socketToSession = new Map(); // socketId -> sessionId
const agentSockets = new Set(); // Set of agent socket IDs

/**
 * Session structure:
 * {
 *   sessionId: string,
 *   siteKey: string,
 *   userLang: string,
 *   socketId: string,
 *   createdAt: Date,
 *   lastActivity: Date,
 *   metadata: object
 * }
 */

/**
 * Message structure:
 * {
 *   id: string,
 *   sessionId: string,
 *   sender: 'user' | 'agent',
 *   originalText: string,
 *   translatedText: string,
 *   originalLang: string,
 *   targetLang: string,
 *   timestamp: Date
 * }
 */

// ==================== SESSION MANAGEMENT ====================

/**
 * Creates a new session
 * @param {string} siteKey - Site key from widget
 * @returns {object} New session object
 */
export function createSession(siteKey) {
  const sessionId = uuidv4();
  const session = {
    sessionId,
    siteKey,
    userLang: 'en', // Default, will be updated
    socketId: null,
    createdAt: new Date(),
    lastActivity: new Date(),
    metadata: {},
  };

  sessions.set(sessionId, session);
  messages.set(sessionId, []);

  console.log(`[Store] Created session: ${sessionId}`);
  return session;
}

/**
 * Gets a session by ID
 * @param {string} sessionId
 * @returns {object|null} Session object or null
 */
export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

/**
 * Updates session metadata
 * @param {string} sessionId
 * @param {object} updates - Fields to update
 * @returns {boolean} Success status
 */
export function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (!session) return false;

  Object.assign(session, updates, { lastActivity: new Date() });
  sessions.set(sessionId, session);

  return true;
}

/**
 * Associates a socket with a session
 * @param {string} sessionId
 * @param {string} socketId
 */
export function linkSocketToSession(sessionId, socketId) {
  socketToSession.set(socketId, sessionId);
  updateSession(sessionId, { socketId });
  console.log(`[Store] Linked socket ${socketId} to session ${sessionId}`);
}

/**
 * Gets session ID from socket ID
 * @param {string} socketId
 * @returns {string|null}
 */
export function getSessionIdBySocket(socketId) {
  return socketToSession.get(socketId) || null;
}

/**
 * Removes session when user disconnects
 * @param {string} socketId
 */
export function removeSessionBySocket(socketId) {
  const sessionId = socketToSession.get(socketId);
  if (sessionId) {
    console.log(`[Store] Removing session ${sessionId}`);
    socketToSession.delete(socketId);
    // Note: We keep session and messages for potential reconnection
    // In production, implement proper cleanup with TTL
  }
}

/**
 * Gets all active sessions
 * @returns {Array} Array of session objects
 */
export function getAllSessions() {
  return Array.from(sessions.values());
}

/**
 * Deletes a session and its messages
 * @param {string} sessionId
 * @returns {boolean} Success status
 */
export function deleteSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;

  // Remove session data
  sessions.delete(sessionId);
  messages.delete(sessionId);

  // Remove socket mapping if exists
  if (session.socketId) {
    socketToSession.delete(session.socketId);
  }

  console.log(`[Store] Deleted session: ${sessionId}`);
  return true;
}

// ==================== MESSAGE MANAGEMENT ====================

/**
 * Adds a message to a session
 * @param {string} sessionId
 * @param {object} messageData
 * @returns {object} Created message object
 */
export function addMessage(sessionId, messageData) {
  const message = {
    id: uuidv4(),
    sessionId,
    timestamp: new Date(),
    ...messageData,
  };

  const sessionMessages = messages.get(sessionId) || [];
  sessionMessages.push(message);
  messages.set(sessionId, sessionMessages);

  // Update session activity
  updateSession(sessionId, {});

  console.log(`[Store] Added message to session ${sessionId}: ${message.sender}`);
  return message;
}

/**
 * Gets all messages for a session
 * @param {string} sessionId
 * @returns {Array} Array of message objects
 */
export function getMessages(sessionId) {
  return messages.get(sessionId) || [];
}

/**
 * Gets recent messages (last N messages)
 * @param {string} sessionId
 * @param {number} limit
 * @returns {Array}
 */
export function getRecentMessages(sessionId, limit = 50) {
  const sessionMessages = messages.get(sessionId) || [];
  return sessionMessages.slice(-limit);
}

// ==================== AGENT MANAGEMENT ====================

/**
 * Registers an agent socket
 * @param {string} socketId
 */
export function registerAgent(socketId) {
  agentSockets.add(socketId);
  console.log(`[Store] Agent connected: ${socketId}`);
}

/**
 * Unregisters an agent socket
 * @param {string} socketId
 */
export function unregisterAgent(socketId) {
  agentSockets.delete(socketId);
  console.log(`[Store] Agent disconnected: ${socketId}`);
}

/**
 * Gets all agent socket IDs
 * @returns {Array}
 */
export function getAgentSockets() {
  return Array.from(agentSockets);
}

/**
 * Checks if a socket is an agent
 * @param {string} socketId
 * @returns {boolean}
 */
export function isAgent(socketId) {
  return agentSockets.has(socketId);
}

// ==================== CLEANUP & UTILITIES ====================

/**
 * Cleans up old sessions (for memory management)
 * In production, this would be handled by Redis TTL or DB cleanup job
 * @param {number} maxAgeMs - Maximum age in milliseconds
 */
export function cleanupOldSessions(maxAgeMs = 24 * 60 * 60 * 1000) {
  const now = new Date();
  let cleaned = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > maxAgeMs) {
      sessions.delete(sessionId);
      messages.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Store] Cleaned up ${cleaned} old sessions`);
  }
}

// Run cleanup every hour
setInterval(() => cleanupOldSessions(), 60 * 60 * 1000);
