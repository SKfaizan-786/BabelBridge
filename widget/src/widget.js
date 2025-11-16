/**
 * LingoLive Chat Widget
 * Embeddable multilingual chat widget for websites
 *
 * Usage:
 * <script>
 *   window.__CHAT_WIDGET_CONFIG = {
 *     backendUrl: "http://localhost:3000",
 *     siteKey: "PUBLIC_SITE_KEY_123",
 *     defaultLanguage: "auto",
 *     availableLanguages: ["en", "hi", "es", "bn"],
 *     theme: { primary: "#0b5cff" }
 *   };
 * </script>
 * <script src="widget.bundle.js"></script>
 */

(function () {
  'use strict';

  // Prevent double initialization
  if (window.ChatWidget) {
    console.warn('[ChatWidget] Already initialized');
    return;
  }

  // ==================== CONFIGURATION ====================

  const DEFAULT_CONFIG = {
    backendUrl: 'http://localhost:3000',
    siteKey: 'PUBLIC_SITE_KEY_123',
    defaultLanguage: 'auto',
    availableLanguages: ['en', 'hi', 'es', 'bn'],
    theme: {
      primary: '#0b5cff',
      background: '#ffffff',
      text: '#333333',
    },
    position: 'bottom-right', // bottom-right, bottom-left
  };

  // ==================== STATE ====================

  let state = {
    isOpen: false,
    isConnected: false,
    isConnecting: false,
    sessionId: null,
    sessionToken: null,
    currentLang: 'en',
    messages: [],
    agentTyping: false,
    locale: {},
  };

  let socket = null;
  let config = null;
  let elements = {};

  // ==================== INITIALIZATION ====================

  async function init(customConfig) {
    config = { ...DEFAULT_CONFIG, ...customConfig };

    console.log('[ChatWidget] Initializing...', config);

    // Detect browser language if auto
    if (config.defaultLanguage === 'auto') {
      const browserLang = navigator.language.split('-')[0];
      config.defaultLanguage = config.availableLanguages.includes(browserLang)
        ? browserLang
        : 'en';
    }

    state.currentLang = config.defaultLanguage;

    try {
      // 1. Authenticate and get session
      await authenticate();

      // 2. Load localized strings
      await loadLocale(state.currentLang);

      // 3. Render widget UI
      renderWidget();

      // 4. Connect to Socket.IO
      connectSocket();

      console.log('[ChatWidget] Initialized successfully');
    } catch (error) {
      console.error('[ChatWidget] Initialization failed:', error);
      showError('Failed to initialize chat widget');
    }
  }

  // ==================== AUTHENTICATION ====================

  async function authenticate() {
    const url = `${config.backendUrl}/api/auth?siteKey=${encodeURIComponent(config.siteKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();

    state.sessionId = data.sessionId;
    state.sessionToken = data.sessionToken;

    console.log('[ChatWidget] Authenticated:', state.sessionId);
  }

  // ==================== LOCALIZATION ====================

  async function loadLocale(lang) {
    const url = `${config.backendUrl}/api/locales/${lang}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load locale: ${response.status}`);
      }

      state.locale = await response.json();
      console.log(`[ChatWidget] Loaded locale: ${lang}`);
    } catch (error) {
      console.error('[ChatWidget] Locale loading failed:', error);
      // Fallback to English
      if (lang !== 'en') {
        await loadLocale('en');
      }
    }
  }

  async function changeLanguage(newLang) {
    if (newLang === state.currentLang) return;

    await loadLocale(newLang);
    state.currentLang = newLang;

    // Update UI
    updateLocaleStrings();

    // Notify backend
    if (socket && socket.connected) {
      socket.emit('set_user_lang', { lang: newLang });
    }

    console.log(`[ChatWidget] Language changed to ${newLang}`);
  }

  function updateLocaleStrings() {
    if (elements.title) elements.title.textContent = state.locale.widgetTitle || 'Chat Support';
    if (elements.subtitle) elements.subtitle.textContent = state.locale.widgetSubtitle || "We're here to help";
    if (elements.input) elements.input.placeholder = state.locale.placeholderMessage || 'Type your message...';
    if (elements.sendBtn) elements.sendBtn.textContent = state.locale.sendButton || 'Send';

    // Update status
    updateConnectionStatus();
  }

  // ==================== SOCKET.IO CONNECTION ====================

  function connectSocket() {
    state.isConnecting = true;
    updateConnectionStatus();

    // Load Socket.IO client from CDN
    if (!window.io) {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
      script.onload = () => initSocket();
      document.head.appendChild(script);
    } else {
      initSocket();
    }
  }

  function initSocket() {
    socket = io(config.backendUrl, {
      auth: {
        token: state.sessionToken,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    socket.on('connect', () => {
      console.log('[ChatWidget] Socket connected');
      state.isConnected = true;
      state.isConnecting = false;
      updateConnectionStatus();

      // Join session room
      socket.emit('join_room', { sessionId: state.sessionId });

      // Set user language
      socket.emit('set_user_lang', { lang: state.currentLang });
    });

    socket.on('disconnect', () => {
      console.log('[ChatWidget] Socket disconnected');
      state.isConnected = false;
      updateConnectionStatus();
    });

    socket.on('reconnecting', () => {
      console.log('[ChatWidget] Socket reconnecting');
      state.isConnecting = true;
      updateConnectionStatus();
    });

    // Message events
    socket.on('session_joined', (data) => {
      console.log('[ChatWidget] Joined session:', data.sessionId);
    });

    socket.on('message_history', (data) => {
      console.log('[ChatWidget] Received message history:', data.messages.length);
      state.messages = data.messages.map(formatMessage);
      renderMessages();
    });

    socket.on('message_sent', (data) => {
      console.log('[ChatWidget] Message sent confirmed:', data.messageId);
    });

    socket.on('agent_message', (data) => {
      console.log('[ChatWidget] Agent message received:', data.text);

      const message = {
        id: data.messageId,
        sender: 'agent',
        text: data.text,
        timestamp: new Date(data.timestamp),
      };

      state.messages.push(message);
      renderMessages();
      playNotificationSound();
    });

    socket.on('agent_typing', () => {
      state.agentTyping = true;
      renderTypingIndicator();
    });

    socket.on('agent_stopped_typing', () => {
      state.agentTyping = false;
      renderTypingIndicator();
    });

    socket.on('lang_updated', (data) => {
      console.log('[ChatWidget] Language updated:', data.lang);
    });

    socket.on('error', (data) => {
      console.error('[ChatWidget] Socket error:', data);
      showError(data.message);
    });
  }

  function formatMessage(msg) {
    return {
      id: msg.id,
      sender: msg.sender,
      text: msg.sender === 'user' ? msg.originalText : msg.translatedText,
      timestamp: new Date(msg.timestamp),
    };
  }

  // ==================== UI RENDERING ====================

  function renderWidget() {
    // Inject styles
    injectStyles();

    // Create widget container
    const container = document.createElement('div');
    container.id = 'lingolive-chat-widget';
    container.className = 'llcw-container';
    document.body.appendChild(container);

    // Create floating button
    const button = document.createElement('button');
    button.className = 'llcw-float-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
      </svg>
    `;
    button.onclick = toggleWidget;
    container.appendChild(button);

    elements.button = button;

    // Create chat panel
    const panel = document.createElement('div');
    panel.className = 'llcw-panel llcw-hidden';
    panel.innerHTML = `
      <div class="llcw-header">
        <div class="llcw-header-info">
          <div class="llcw-header-title">${state.locale.widgetTitle || 'Chat Support'}</div>
          <div class="llcw-header-subtitle">${state.locale.widgetSubtitle || "We're here to help"}</div>
        </div>
        <div class="llcw-header-actions">
          <select class="llcw-lang-select" id="llcw-lang-select">
            ${config.availableLanguages
              .map(
                (lang) =>
                  `<option value="${lang}" ${lang === state.currentLang ? 'selected' : ''}>${lang.toUpperCase()}</option>`
              )
              .join('')}
          </select>
          <button class="llcw-close-btn" id="llcw-close-btn">✕</button>
        </div>
      </div>
      <div class="llcw-status" id="llcw-status">
        ${state.locale.connecting || 'Connecting...'}
      </div>
      <div class="llcw-messages" id="llcw-messages">
        <!-- Messages will be rendered here -->
      </div>
      <div class="llcw-typing" id="llcw-typing" style="display: none;">
        ${state.locale.agentTyping || 'Agent is typing...'}
      </div>
      <div class="llcw-input-area">
        <input type="text" class="llcw-input" id="llcw-input" placeholder="${state.locale.placeholderMessage || 'Type your message...'}" />
        <button class="llcw-send-btn" id="llcw-send-btn">${state.locale.sendButton || 'Send'}</button>
      </div>
      <div class="llcw-footer">
        <span>${state.locale.poweredBy || 'Powered by LingoLive'}</span>
      </div>
    `;

    container.appendChild(panel);

    // Store element references
    elements.container = container;
    elements.panel = panel;
    elements.title = panel.querySelector('.llcw-header-title');
    elements.subtitle = panel.querySelector('.llcw-header-subtitle');
    elements.status = panel.querySelector('#llcw-status');
    elements.messages = panel.querySelector('#llcw-messages');
    elements.typing = panel.querySelector('#llcw-typing');
    elements.input = panel.querySelector('#llcw-input');
    elements.sendBtn = panel.querySelector('#llcw-send-btn');
    elements.closeBtn = panel.querySelector('#llcw-close-btn');
    elements.langSelect = panel.querySelector('#llcw-lang-select');

    // Attach event listeners
    elements.closeBtn.onclick = closeWidget;
    elements.sendBtn.onclick = sendMessage;
    elements.input.onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
    elements.langSelect.onchange = (e) => changeLanguage(e.target.value);

    // Typing indicators
    let typingTimeout;
    elements.input.oninput = () => {
      if (socket && socket.connected) {
        socket.emit('typing');
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          socket.emit('stopped_typing');
        }, 1000);
      }
    };
  }

  function toggleWidget() {
    if (state.isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  function openWidget() {
    state.isOpen = true;
    elements.panel.classList.remove('llcw-hidden');
    elements.button.style.display = 'none';
    elements.input.focus();
  }

  function closeWidget() {
    state.isOpen = false;
    elements.panel.classList.add('llcw-hidden');
    elements.button.style.display = 'flex';
  }

  function updateConnectionStatus() {
    if (!elements.status) return;

    if (state.isConnected) {
      elements.status.textContent = state.locale.connected || 'Connected';
      elements.status.className = 'llcw-status llcw-status-connected';
    } else if (state.isConnecting) {
      elements.status.textContent = state.locale.connecting || 'Connecting...';
      elements.status.className = 'llcw-status llcw-status-connecting';
    } else {
      elements.status.textContent = state.locale.disconnected || 'Disconnected';
      elements.status.className = 'llcw-status llcw-status-disconnected';
    }
  }

  function renderMessages() {
    if (!elements.messages) return;

    elements.messages.innerHTML = state.messages
      .map((msg) => {
        const isUser = msg.sender === 'user';
        const time = formatTime(msg.timestamp);

        return `
        <div class="llcw-message ${isUser ? 'llcw-message-user' : 'llcw-message-agent'}">
          <div class="llcw-message-content">
            <div class="llcw-message-text">${escapeHtml(msg.text)}</div>
            <div class="llcw-message-time">${time}</div>
          </div>
        </div>
      `;
      })
      .join('');

    // Scroll to bottom
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function renderTypingIndicator() {
    if (!elements.typing) return;

    if (state.agentTyping) {
      elements.typing.style.display = 'block';
    } else {
      elements.typing.style.display = 'none';
    }
  }

  function sendMessage() {
    const text = elements.input.value.trim();

    if (!text) return;

    if (!socket || !socket.connected) {
      showError(state.locale.disconnected || 'Not connected');
      return;
    }

    // Add message to UI optimistically
    const message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    state.messages.push(message);
    renderMessages();

    // Send to server
    socket.emit('user_message', {
      text,
      lang: state.currentLang,
    });

    // Clear input
    elements.input.value = '';
  }

  // ==================== UTILITIES ====================

  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(message) {
    console.error('[ChatWidget] Error:', message);
    // Could show a toast notification here
  }

  function playNotificationSound() {
    // Optional: play a subtle notification sound
  }

  // ==================== STYLES ====================

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Container */
      .llcw-container {
        position: fixed;
        ${config.position === 'bottom-left' ? 'left' : 'right'}: 20px;
        bottom: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }

      /* Float Button */
      .llcw-float-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.theme.primary};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .llcw-float-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      /* Panel */
      .llcw-panel {
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: opacity 0.3s, transform 0.3s;
      }

      .llcw-panel.llcw-hidden {
        display: none;
      }

      /* Header */
      .llcw-header {
        background: ${config.theme.primary};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .llcw-header-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .llcw-header-subtitle {
        font-size: 13px;
        opacity: 0.9;
      }

      .llcw-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .llcw-lang-select {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      }

      .llcw-close-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 4px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .llcw-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      /* Status */
      .llcw-status {
        padding: 8px 16px;
        font-size: 12px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
      }

      .llcw-status-connected {
        background: #ecfdf5;
        color: #059669;
      }

      .llcw-status-connecting {
        background: #fef3c7;
        color: #d97706;
      }

      .llcw-status-disconnected {
        background: #fee2e2;
        color: #dc2626;
      }

      /* Messages */
      .llcw-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9fafb;
      }

      .llcw-message {
        margin-bottom: 12px;
        display: flex;
      }

      .llcw-message-user {
        justify-content: flex-end;
      }

      .llcw-message-agent {
        justify-content: flex-start;
      }

      .llcw-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.4;
      }

      .llcw-message-user .llcw-message-content {
        background: ${config.theme.primary};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .llcw-message-agent .llcw-message-content {
        background: white;
        color: #333;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 4px;
      }

      .llcw-message-time {
        font-size: 11px;
        margin-top: 4px;
        opacity: 0.7;
      }

      /* Typing Indicator */
      .llcw-typing {
        padding: 8px 16px;
        font-size: 13px;
        font-style: italic;
        color: #6b7280;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }

      /* Input Area */
      .llcw-input-area {
        display: flex;
        padding: 12px;
        border-top: 1px solid #e5e7eb;
        background: white;
        gap: 8px;
      }

      .llcw-input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 10px 12px;
        font-size: 14px;
        outline: none;
      }

      .llcw-input:focus {
        border-color: ${config.theme.primary};
        box-shadow: 0 0 0 3px rgba(11, 92, 255, 0.1);
      }

      .llcw-send-btn {
        background: ${config.theme.primary};
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }

      .llcw-send-btn:hover {
        background: #0a4fd4;
      }

      /* Footer */
      .llcw-footer {
        padding: 8px 12px;
        text-align: center;
        font-size: 11px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
        background: white;
      }

      /* Scrollbar */
      .llcw-messages::-webkit-scrollbar {
        width: 6px;
      }

      .llcw-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .llcw-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }

      .llcw-messages::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .llcw-panel {
          width: 100vw;
          height: 100vh;
          border-radius: 0;
        }

        .llcw-container {
          right: 0;
          bottom: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ==================== PUBLIC API ====================

  window.ChatWidget = {
    init,
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    send: sendMessage,
    changeLanguage,
  };

  // Auto-initialize if config is present
  if (window.__CHAT_WIDGET_CONFIG) {
    init(window.__CHAT_WIDGET_CONFIG);
  }
})();
