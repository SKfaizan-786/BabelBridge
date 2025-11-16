import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/SessionList.css';

const SessionList = ({ selectedSession, onSelectSession }) => {
  const { sessions, deleteSession } = useSocket();

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation(); // Prevent selecting the session when clicking delete
    if (window.confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const generateUserName = (sessionId) => {
    // Generate a friendly name from session ID
    const adjectives = ['Happy', 'Bright', 'Swift', 'Kind', 'Smart', 'Cool', 'Wise', 'Bold'];
    const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Bear', 'Lion'];

    // Use session ID to deterministically pick words
    const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const adj = adjectives[hash % adjectives.length];
    const noun = nouns[(hash * 7) % nouns.length];

    return `${adj} ${noun}`;
  };

  return (
    <div className="session-list">
      <div className="session-list-header">
        <h3>Active Sessions</h3>
        <span className="session-count">{sessions.length}</span>
      </div>

      <div className="session-list-content">
        {sessions.length === 0 ? (
          <div className="empty-sessions">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p>No active sessions</p>
            <span>Waiting for users...</span>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              className={`session-item ${selectedSession?.sessionId === session.sessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(session)}
            >
              <div className="session-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div className="session-content">
                <div className="session-header-info">
                  <span className="session-id">{generateUserName(session.sessionId)}</span>
                  <span className="session-time">{formatTime(session.createdAt)}</span>
                </div>

                <div className="session-meta">
                  <span className={`session-status ${session.status}`}>
                    <span className="status-dot" />
                    {session.status}
                  </span>
                  <span className="session-lang-badge">{session.userLang || 'en'}</span>
                </div>
              </div>

              <button
                className="session-delete-btn"
                onClick={(e) => handleDeleteSession(e, session.sessionId)}
                title="Delete session"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
