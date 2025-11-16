import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

const API_URL = 'https://babelbridge.onrender.com';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState({});
  const [agentId, setAgentId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: {
        clientType: 'agent'
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Dashboard] Connected to server');
      setConnected(true);

      // Register as agent
      newSocket.emit('agent_join', { agentName: 'Support Agent' });
    });

    newSocket.on('disconnect', () => {
      console.log('[Dashboard] Disconnected from server');
      setConnected(false);
    });

    // Agent registration
    newSocket.on('agent_registered', (data) => {
      console.log('[Dashboard] Registered as agent:', data.agentId);
      setAgentId(data.agentId);
    });

    // Session events
    newSocket.on('new_session', (session) => {
      console.log('[Dashboard] New session:', session);
      setSessions(prev => [session, ...prev]);
    });

    newSocket.on('sessions_list', (data) => {
      console.log('[Dashboard] Sessions list:', data);
      setSessions(data.sessions || []);
    });

    newSocket.on('session_assigned', (data) => {
      console.log('[Dashboard] Session assigned:', data.sessionId);
      setSessions(prev => prev.map(s =>
        s.sessionId === data.sessionId
          ? { ...s, agentId: data.agentId, status: 'active' }
          : s
      ));
    });

    // Message events
    newSocket.on('user_message', (data) => {
      console.log('[Dashboard] User message:', data);
      setMessages(prev => ({
        ...prev,
        [data.sessionId]: [
          ...(prev[data.sessionId] || []),
          {
            id: data.messageId || Date.now(),
            type: 'user',
            text: data.text, // Translated text (English for agent)
            originalText: data.originalText,
            originalLang: data.originalLang,
            timestamp: data.timestamp
          }
        ]
      }));
    });

    newSocket.on('message_sent', (data) => {
      console.log('[Dashboard] Message sent confirmation:', data);
      // Message was already added optimistically in sendMessage
      // Just log confirmation
    });

    // Session history
    newSocket.on('session_history', (data) => {
      console.log('[Dashboard] Session history received:', data);
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => ({
          ...prev,
          [data.sessionId]: data.messages.map(msg => ({
            id: msg.id,
            type: msg.sender,
            text: msg.sender === 'user' ? msg.translatedText : msg.originalText,
            originalText: msg.originalText,
            originalLang: msg.originalLang,
            timestamp: msg.timestamp
          }))
        }));
      }
    });

    // Session deletion event
    newSocket.on('session_deleted', (data) => {
      console.log('[Dashboard] Session deleted:', data.sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== data.sessionId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[data.sessionId];
        return newMessages;
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = (sessionId, text) => {
    if (!socket || !connected) {
      console.error('[Dashboard] Cannot send message: not connected');
      return;
    }

    const message = {
      sessionId,
      text,
      timestamp: new Date().toISOString()
    };

    // Add message optimistically to UI
    setMessages(prev => ({
      ...prev,
      [sessionId]: [
        ...(prev[sessionId] || []),
        {
          id: Date.now(),
          type: 'agent',
          text: text,
          timestamp: message.timestamp
        }
      ]
    }));

    socket.emit('agent_message', message);
  };

  const claimSession = (sessionId) => {
    if (!socket || !connected) {
      console.error('[Dashboard] Cannot claim session: not connected');
      return;
    }

    socket.emit('claim_session', { sessionId });
  };

  const startTyping = (sessionId) => {
    if (!socket || !connected) return;
    socket.emit('agent_typing', { sessionId });
  };

  const stopTyping = (sessionId) => {
    if (!socket || !connected) return;
    socket.emit('agent_typing_stop', { sessionId });
  };

  const requestSessionHistory = (sessionId) => {
    if (!socket || !connected) {
      console.error('[Dashboard] Cannot request history: not connected');
      return;
    }
    console.log('[Dashboard] Requesting history for session:', sessionId);
    socket.emit('request_session_history', { sessionId });
  };

  const deleteSession = (sessionId) => {
    if (!socket || !connected) {
      console.error('[Dashboard] Cannot delete session: not connected');
      return;
    }
    console.log('[Dashboard] Deleting session:', sessionId);
    socket.emit('delete_session', { sessionId });
  };

  const value = {
    socket,
    connected,
    sessions,
    messages,
    agentId,
    sendMessage,
    claimSession,
    startTyping,
    stopTyping,
    requestSessionHistory,
    deleteSession
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
