import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import '../styles/Sidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { connected, sessions } = useSocket();

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const waitingSessions = sessions.filter(s => s.status === 'waiting').length;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          {!collapsed && <h1 className="logo-text gradient-text">BabelBridge</h1>}
        </div>

        <button className="toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      <div className="sidebar-stats">
        <div className="stat-card">
          <div className="stat-icon active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          {!collapsed && (
            <div className="stat-info">
              <div className="stat-value">{activeSessions}</div>
              <div className="stat-label">Active</div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon waiting">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          {!collapsed && (
            <div className="stat-info">
              <div className="stat-value">{waitingSessions}</div>
              <div className="stat-label">Waiting</div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${connected ? 'success' : 'error'}`}>
            <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
          </div>
          {!collapsed && (
            <div className="stat-info">
              <div className="stat-value">{connected ? 'Online' : 'Offline'}</div>
              <div className="stat-label">Status</div>
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Conversations</span>
          </a>

          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Customers</span>
          </a>

          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Analytics</span>
          </a>

          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </a>
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
