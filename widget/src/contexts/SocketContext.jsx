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

const SITE_KEY = 'PUBLIC_SITE_KEY_123'; // Default site key from backend

export const SocketProvider = ({ children, apiUrl, initialLang = 'en' }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agentTyping, setAgentTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [authError, setAuthError] = useState(null);
  const socketRef = useRef(null);
  const isAuthenticating = useRef(false);

  useEffect(() => {
    // Prevent double authentication
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;

    const authenticateAndConnect = async () => {
      try {
        // Use sessionStorage instead of localStorage so each tab gets its own session
        const existingSession = sessionStorage.getItem('babelbridge_session');
        const existingToken = sessionStorage.getItem('babelbridge_token');

        let authData;

        if (existingSession && existingToken) {
          console.log('[BabelBridge] Reusing existing session:', existingSession);
          authData = {
            sessionId: existingSession,
            sessionToken: existingToken
          };
        } else {
          console.log('[BabelBridge] Authenticating with backend...');

          // Step 1: Get session token from backend
          const response = await fetch(`${apiUrl}/api/auth?siteKey=${SITE_KEY}`);

          if (!response.ok) {
            throw new Error(`Auth failed: ${response.statusText}`);
          }

          authData = await response.json();
          console.log('[BabelBridge] Authentication successful:', authData.sessionId);

          // Store session in sessionStorage (unique per tab)
          sessionStorage.setItem('babelbridge_session', authData.sessionId);
          sessionStorage.setItem('babelbridge_token', authData.sessionToken);
        }

        setSessionId(authData.sessionId);
        setSessionToken(authData.sessionToken);

        // Step 2: Connect to Socket.IO with the token
        const newSocket = io(apiUrl, {
          auth: {
            token: authData.sessionToken,
            clientType: 'widget'
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
          console.log('[BabelBridge] Connected to server');
          setConnected(true);

          // Join session room
          newSocket.emit('join_room', { sessionId: authData.sessionId });

          // Set initial language
          newSocket.emit('set_user_lang', { lang: initialLang });
        });

        newSocket.on('disconnect', () => {
          console.log('[BabelBridge] Disconnected from server');
          setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('[BabelBridge] Connection error:', error.message);
          setAuthError(error.message);
        });

        // Session events
        newSocket.on('session_created', (data) => {
          console.log('[BabelBridge] Session confirmed:', data.sessionId);
          if (data.welcomeMessage) {
            setMessages([{
              id: Date.now(),
              type: 'agent',
              text: data.welcomeMessage,
              timestamp: new Date().toISOString()
            }]);
          }
        });

        // Message events
        newSocket.on('user_message_received', (data) => {
          console.log('[BabelBridge] Message acknowledged:', data);
        });

        newSocket.on('agent_message', (data) => {
          console.log('[BabelBridge] Agent message received:', data);
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'agent',
            text: data.text,
            translatedFrom: data.translatedFrom,
            timestamp: new Date().toISOString()
          }]);
          setAgentTyping(false);
        });

        newSocket.on('agent_typing', () => {
          setAgentTyping(true);
        });

        newSocket.on('agent_typing_stop', () => {
          setAgentTyping(false);
        });

        // Language change confirmation
        newSocket.on('language_updated', (data) => {
          console.log('[BabelBridge] Language updated to:', data.lang);
          setCurrentLang(data.lang);
        });

        // Error handling
        newSocket.on('error', (error) => {
          console.error('[BabelBridge] Socket error:', error);
          setAuthError(error.message);
        });

      } catch (error) {
        console.error('[BabelBridge] Authentication failed:', error);
        setAuthError(error.message);
      }
    };

    authenticateAndConnect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      isAuthenticating.current = false;
    };
  }, [apiUrl, initialLang]);

  // Listen for session language change events (from demo page or widget language selector)
  useEffect(() => {
    const handleSessionLangChange = (event) => {
      console.log('[Widget Socket] Session language change event received:', event.detail.lang);
      if (socket && connected) {
        socket.emit('set_user_lang', { lang: event.detail.lang });
        setCurrentLang(event.detail.lang);
      }
    };

    window.addEventListener('babelbridge:session-lang-change', handleSessionLangChange);
    return () => {
      window.removeEventListener('babelbridge:session-lang-change', handleSessionLangChange);
    };
  }, [socket, connected]);

  const sendMessage = (text) => {
    if (!socket || !connected) {
      console.error('[BabelBridge] Cannot send message: not connected');
      return;
    }

    const message = {
      text,
      lang: currentLang,
      timestamp: new Date().toISOString()
    };

    // Add to local messages immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text,
      timestamp: message.timestamp
    }]);

    // Emit to server
    socket.emit('user_message', message);
  };

  const changeLanguage = (lang) => {
    if (!socket || !connected) {
      console.error('[BabelBridge] Cannot change language: not connected');
      return;
    }

    socket.emit('set_user_lang', { lang });
    setCurrentLang(lang);
  };

  const value = {
    socket,
    connected,
    sessionId,
    messages,
    agentTyping,
    currentLang,
    authError,
    sendMessage,
    changeLanguage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
