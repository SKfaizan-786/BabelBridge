import React, { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useLocale } from '../contexts/LocaleContext';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import '../styles/MessageList.css';

const MessageList = () => {
  const { messages, agentTyping, connected } = useSocket();
  const { t } = useLocale();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentTyping]);

  if (!connected) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <p className="empty-title">{t('connecting')}</p>
          <p className="empty-subtitle">{t('widgetSubtitle')}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-state">
          <div className="empty-icon gradient-bg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="empty-title gradient-text">{t('welcomeMessage')}</p>
          <p className="empty-subtitle">{t('widgetSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-list-inner">
        {messages.map((message, index) => (
          <Message key={message.id || index} message={message} />
        ))}

        {agentTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
