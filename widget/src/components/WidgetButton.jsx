import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import '../styles/WidgetButton.css';

const WidgetButton = ({ onClick }) => {
  const { connected, messages } = useSocket();
  const unreadCount = messages.filter(m => m.type === 'agent' && !m.read).length;

  return (
    <button
      className="widget-button"
      onClick={onClick}
      aria-label="Open BabelBridge Chat"
    >
      <div className="widget-button-inner">
        <svg
          className="widget-button-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {unreadCount > 0 && (
          <div className="widget-button-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {!connected && (
          <div className="widget-button-status offline" />
        )}
      </div>

      <div className="widget-button-glow" />
    </button>
  );
};

export default WidgetButton;
