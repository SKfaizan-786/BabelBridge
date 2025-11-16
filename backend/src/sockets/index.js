/**
 * Socket.IO Event Handlers
 * Manages real-time communication between widgets, agents, and backend
 */

import { verifySessionToken } from '../utils/tokens.js';
import {
  getSession,
  updateSession,
  linkSocketToSession,
  removeSessionBySocket,
  addMessage,
  getMessages,
  registerAgent,
  unregisterAgent,
  getAgentSockets,
  getAllSessions,
  sessions,
  messages as messagesMap,
} from '../store/sessions.js';
import { translateUserToAgent, translateAgentToUser } from '../translation/translate.js';
import { normalizeLang } from '../utils/language.js';
import config from '../config/env.js';

/**
 * Initializes Socket.IO event handlers
 * @param {object} io - Socket.IO server instance
 */
export function initializeSocketHandlers(io) {
  // Middleware: Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const clientType = socket.handshake.auth.clientType || socket.handshake.query.clientType;

    // Allow agent connections without session token
    if (clientType === 'agent') {
      console.log(`[Socket] Agent connecting: ${socket.id}`);
      socket.isAgent = true;
      return next();
    }

    // Verify session token for widget connections
    if (!token) {
      console.warn(`[Socket] Connection rejected - no token: ${socket.id}`);
      return next(new Error('Authentication required'));
    }

    const decoded = verifySessionToken(token);
    if (!decoded) {
      console.warn(`[Socket] Connection rejected - invalid token: ${socket.id}`);
      return next(new Error('Invalid token'));
    }

    // Attach session info to socket
    socket.sessionId = decoded.sessionId;
    socket.siteKey = decoded.siteKey;

    console.log(`[Socket] Widget authenticated: ${socket.id} (session: ${socket.sessionId})`);
    next();
  });

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle agent connections
    if (socket.isAgent) {
      handleAgentConnection(socket, io);
      return;
    }

    // Handle widget connections
    handleWidgetConnection(socket, io);
  });

  console.log('[Socket] Event handlers initialized');
}

/**
 * Handles widget client connections and events
 */
function handleWidgetConnection(socket, io) {
  const { sessionId, siteKey } = socket;

  // Event: join_room
  // Widget joins its session room
  socket.on('join_room', (data) => {
    const { sessionId: requestedSessionId } = data || {};

    // Verify session ID matches
    if (requestedSessionId !== sessionId) {
      socket.emit('error', { message: 'Session ID mismatch' });
      return;
    }

    // Check if session exists, if not recreate it (handles server restarts)
    let session = getSession(sessionId);
    if (!session) {
      console.log(`[Socket] Session ${sessionId} not found in store, recreating...`);
      // Recreate session with existing sessionId
      session = {
        sessionId,
        siteKey,
        userLang: 'en',
        socketId: socket.id,
        createdAt: new Date(),
        lastActivity: new Date(),
        metadata: {},
      };
      // Manually add to sessions Map since createSession generates new ID
      sessions.set(sessionId, session);
      messagesMap.set(sessionId, []);
      console.log(`[Store] Recreated session: ${sessionId}`);
    }

    // Join the session room
    socket.join(sessionId);
    linkSocketToSession(sessionId, socket.id);

    console.log(`[Socket] Widget ${socket.id} joined room ${sessionId}`);

    // Send session joined confirmation
    socket.emit('session_joined', {
      sessionId,
      timestamp: new Date(),
    });

    // Notify agents about new session
    notifyAgentsNewSession(io, sessionId);

    // Send message history
    const history = getMessages(sessionId);
    socket.emit('message_history', { messages: history });
  });

  // Event: set_user_lang
  // Widget sets/updates user language preference
  socket.on('set_user_lang', async (data) => {
    const { lang } = data;

    // Normalize and validate language
    const normalizedLang = normalizeLang(lang);

    if (!config.supportedLanguages.includes(normalizedLang)) {
      socket.emit('error', { message: 'Invalid language code' });
      return;
    }

    updateSession(sessionId, { userLang: normalizedLang });
    console.log(`[Socket] Session ${sessionId} language set to ${normalizedLang}`);

    socket.emit('lang_updated', { lang: normalizedLang });
  });

  // Event: user_message
  // User sends a message from the widget
  socket.on('user_message', async (data) => {
    const { text, lang } = data;

    if (!text || !text.trim()) {
      return; // Ignore empty messages
    }

    const session = getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    const userLang = normalizeLang(lang || session.userLang || 'en');

    console.log(`[Socket] User message (${sessionId}): "${text.substring(0, 50)}..." [${userLang}]`);

    try {
      // Translate user message to English for agent using new helper
      const translatedText = await translateUserToAgent(text, userLang);

      // Store message
      const message = addMessage(sessionId, {
        sender: 'user',
        originalText: text,
        translatedText,
        originalLang: userLang,
        targetLang: config.agentLanguage,
      });

      // Confirm to user
      socket.emit('message_sent', {
        messageId: message.id,
        timestamp: message.timestamp,
      });

      // Forward to agents (in English)
      notifyAgentsNewMessage(io, sessionId, message);
    } catch (error) {
      console.error('[Socket] Error handling user message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Event: typing
  // User is typing
  socket.on('typing', () => {
    notifyAgentsTyping(io, sessionId, true);
  });

  // Event: stopped_typing
  // User stopped typing
  socket.on('stopped_typing', () => {
    notifyAgentsTyping(io, sessionId, false);
  });

  // Event: disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Widget disconnected: ${socket.id} (session: ${sessionId})`);
    removeSessionBySocket(socket.id);
    notifyAgentsSessionEnded(io, sessionId);
  });
}

/**
 * Handles agent dashboard connections and events
 */
function handleAgentConnection(socket, io) {
  registerAgent(socket.id);

  // Send all active sessions to agent
  const sessions = getAllSessions();
  socket.emit('sessions_list', { sessions });

  console.log(`[Socket] Agent ${socket.id} connected and received ${sessions.length} sessions`);

  // Event: request_session_history
  // Agent requests message history for a session
  socket.on('request_session_history', (data) => {
    const { sessionId } = data;
    const messages = getMessages(sessionId);

    socket.emit('session_history', {
      sessionId,
      messages,
    });

    console.log(`[Socket] Agent ${socket.id} requested history for session ${sessionId}`);
  });

  // Event: agent_message
  // Agent sends a reply to a user
  socket.on('agent_message', async (data) => {
    const { sessionId, text } = data;

    if (!text || !text.trim()) {
      return;
    }

    const session = getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    const userLang = normalizeLang(session.userLang || 'en');

    console.log(`[Socket] Agent message to ${sessionId}: "${text.substring(0, 50)}..."`);

    try {
      // Translate agent message from English to user's language using new helper
      const translatedText = await translateAgentToUser(text, userLang);

      // Store message
      const message = addMessage(sessionId, {
        sender: 'agent',
        originalText: text,
        translatedText,
        originalLang: config.agentLanguage,
        targetLang: userLang,
      });

      // Send to user (translated)
      io.to(sessionId).emit('agent_message', {
        messageId: message.id,
        text: translatedText,
        timestamp: message.timestamp,
      });

      // Confirm to agent
      socket.emit('message_sent', {
        sessionId,
        messageId: message.id,
        timestamp: message.timestamp,
      });
    } catch (error) {
      console.error('[Socket] Error handling agent message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Event: agent_typing
  // Agent is typing
  socket.on('agent_typing', (data) => {
    const { sessionId } = data;
    io.to(sessionId).emit('agent_typing');
  });

  // Event: agent_stopped_typing
  // Agent stopped typing
  socket.on('agent_stopped_typing', (data) => {
    const { sessionId } = data;
    io.to(sessionId).emit('agent_stopped_typing');
  });

  // Event: disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Agent disconnected: ${socket.id}`);
    unregisterAgent(socket.id);
  });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Notifies all connected agents about a new session
 */
function notifyAgentsNewSession(io, sessionId) {
  const session = getSession(sessionId);
  const agentSockets = getAgentSockets();

  agentSockets.forEach((agentSocketId) => {
    io.to(agentSocketId).emit('new_session', { session });
  });
}

/**
 * Notifies all connected agents about a new user message
 */
function notifyAgentsNewMessage(io, sessionId, message) {
  const agentSockets = getAgentSockets();

  agentSockets.forEach((agentSocketId) => {
    io.to(agentSocketId).emit('user_message', {
      sessionId,
      messageId: message.id,
      text: message.translatedText, // Agent sees English
      originalText: message.originalText,
      originalLang: message.originalLang,
      timestamp: message.timestamp,
    });
  });
}

/**
 * Notifies agents when user is typing
 */
function notifyAgentsTyping(io, sessionId, isTyping) {
  const agentSockets = getAgentSockets();
  const event = isTyping ? 'user_typing' : 'user_stopped_typing';

  agentSockets.forEach((agentSocketId) => {
    io.to(agentSocketId).emit(event, { sessionId });
  });
}

/**
 * Notifies agents when a session ends
 */
function notifyAgentsSessionEnded(io, sessionId) {
  const agentSockets = getAgentSockets();

  agentSockets.forEach((agentSocketId) => {
    io.to(agentSocketId).emit('session_ended', { sessionId });
  });
}
