import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import { useLocale } from '../contexts/LocaleContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LanguageSelector from './LanguageSelector';
import '../styles/WidgetWindow.css';

const WidgetWindow = ({ onClose, onMinimize, onMaximize, isMinimized }) => {
  const { toggleTheme, isDark } = useTheme();
  const { connected, currentLang } = useSocket();
  const { t } = useLocale();
  const [showLangSelector, setShowLangSelector] = useState(false);

  if (isMinimized) {
    return (
      <div className="widget-window-minimized" onClick={onMaximize}>
        <div className="minimized-content">
          <svg className="minimized-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="minimized-text">{t('widgetTitle')}</span>
          <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="widget-window">
      <div className="widget-header">
        <div className="header-left">
          <div className="header-logo">
            <div className="logo-gradient">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className="header-info">
            <h3 className="header-title gradient-text">{t('widgetTitle')}</h3>
            <div className="header-status">
              <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
              <span className="status-text">
                {connected ? t('online') : t('connecting')}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="header-button"
            onClick={() => setShowLangSelector(!showLangSelector)}
            aria-label="Change language"
            title="Change language"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>

          <button
            className="header-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            className="header-button"
            onClick={onMinimize}
            aria-label="Minimize"
            title="Minimize"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14" />
            </svg>
          </button>

          <button
            className="header-button close"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showLangSelector && (
        <LanguageSelector
          currentLang={currentLang}
          onClose={() => setShowLangSelector(false)}
        />
      )}

      <div className="widget-body">
        <MessageList />
      </div>

      <div className="widget-footer">
        <MessageInput />
        <div className="footer-branding">
          {t('poweredBy')}
        </div>
      </div>
    </div>
  );
};

export default WidgetWindow;
