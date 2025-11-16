import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Header.css';

const Header = ({ selectedSession }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        <h2 className="header-title">
          {selectedSession ? (
            <>
              <span className="gradient-text">Session</span> #{selectedSession.sessionId?.substring(0, 8)}
            </>
          ) : (
            <span className="gradient-text">Dashboard</span>
          )}
        </h2>
        {selectedSession && (
          <div className="session-info">
            <div className="session-badge">
              <span className={`badge-dot ${selectedSession.status}`} />
              {selectedSession.status}
            </div>
            <span className="session-lang">{selectedSession.userLang || 'en'}</span>
          </div>
        )}
      </div>

      <div className="header-actions">
        <button className="header-btn" onClick={toggleTheme} aria-label="Toggle theme">
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

        <div className="header-profile">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
