import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SocketProvider } from '../contexts/SocketContext';
import { LocaleProvider } from '../contexts/LocaleContext';
import WidgetButton from './WidgetButton';
import WidgetWindow from './WidgetWindow';
import '../styles/ChatWidget.css';

const ChatWidget = ({ apiUrl, position = 'bottom-right', theme, primaryColor, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  return (
    <ThemeProvider initialTheme={theme}>
      <LocaleProvider apiUrl={apiUrl} initialLang={lang}>
        <SocketProvider apiUrl={apiUrl} initialLang={lang}>
          <div className={`chat-widget-container ${position}`}>
            {!isOpen && <WidgetButton onClick={handleToggle} />}

            {isOpen && (
              <WidgetWindow
                onClose={handleClose}
                onMinimize={handleMinimize}
                onMaximize={handleMaximize}
                isMinimized={isMinimized}
              />
            )}
          </div>
        </SocketProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default ChatWidget;
