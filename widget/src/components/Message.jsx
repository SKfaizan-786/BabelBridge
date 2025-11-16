import React from 'react';
import '../styles/Message.css';

const Message = ({ message }) => {
  const { type, text, translatedFrom, timestamp } = message;
  const isUser = type === 'user';

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-agent'}`}>
      <div className="message-content">
        {!isUser && (
          <div className="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}

        <div className="message-bubble-wrapper">
          <div className="message-bubble">
            <p className="message-text">{text}</p>

            {translatedFrom && (
              <div className="message-translation-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Translated from {translatedFrom}</span>
              </div>
            )}
          </div>

          <div className="message-meta">
            <span className="message-time">{formatTime(timestamp)}</span>
          </div>
        </div>

        {isUser && (
          <div className="message-avatar user-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
