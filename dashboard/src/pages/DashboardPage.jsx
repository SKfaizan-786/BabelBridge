import React, { useState } from 'react';
import { SocketProvider } from '../contexts/SocketContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatArea from '../components/ChatArea';
import SessionList from '../components/SessionList';

const DashboardPage = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SocketProvider>
      <div className="app">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="main-content">
          <Header selectedSession={selectedSession} />

          <div className="content-area">
            <div className="session-list-container">
              <SessionList
                selectedSession={selectedSession}
                onSelectSession={setSelectedSession}
              />
            </div>

            <div className="chat-area-container">
              <ChatArea selectedSession={selectedSession} />
            </div>
          </div>
        </div>
      </div>
    </SocketProvider>
  );
};

export default DashboardPage;
