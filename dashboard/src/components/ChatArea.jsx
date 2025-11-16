import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/ChatArea.css';

const ChatArea = ({ selectedSession }) => {
  const { messages, sendMessage, claimSession, requestSessionHistory } = useSocket();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const sessionMessages = selectedSession
    ? messages[selectedSession.sessionId] || []
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Request session history when a session is selected
  const prevSessionIdRef = useRef(null);
  useEffect(() => {
    if (selectedSession && selectedSession.sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = selectedSession.sessionId;
      requestSessionHistory(selectedSession.sessionId);
    }
  }, [selectedSession, requestSessionHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedSession) return;

    sendMessage(selectedSession.sessionId, inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleClaimSession = () => {
    if (selectedSession) {
      claimSession(selectedSession.sessionId);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedSession) {
    return (
      <div className="chat-area empty">
        <div className="empty-state">
          <div className="empty-icon-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="gradient-text">Welcome to BabelBridge</h3>
          <p>Select a session from the left to start chatting</p>
        </div>
      </div>
    );
  }

  const needsToClaim = selectedSession.status === 'waiting';

  return (
    <div className="chat-area">
      {needsToClaim && (
        <div className="claim-banner">
          <div className="claim-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>This session is waiting for an agent</span>
          </div>
          <button className="claim-btn" onClick={handleClaimSession}>
            Claim Session
          </button>
        </div>
      )}

      <div className="messages-area">
        {sessionMessages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. {needsToClaim ? 'Claim this session to start chatting.' : 'Start the conversation!'}</p>
          </div>
        ) : (
          <div className="messages-list">
            {sessionMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {msg.type === 'user' ? (
                      <>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </>
                    ) : (
                      <>
                        <path d="M12 2v20M2 12h20" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    {msg.type === 'user' && msg.originalText && msg.originalText !== msg.text && (
                      <div className="translation-info">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>Translated from {msg.originalLang || 'user language'}</span>
                        <div className="original-text">Original: "{msg.originalText}"</div>
                      </div>
                    )}
                  </div>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form className="input-area" onSubmit={handleSend}>
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder={needsToClaim ? "Claim the session to reply..." : "Type your message..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={needsToClaim}
            rows={1}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || needsToClaim}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
