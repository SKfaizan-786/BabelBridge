import React, { createContext, useContext, useState, useEffect } from 'react';

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};

const DEFAULT_STRINGS = {
  widgetTitle: 'BabelBridge Support',
  widgetSubtitle: "We're here to help",
  placeholderMessage: 'Type your message...',
  sendButton: 'Send',
  closeButton: 'Close',
  minimizeButton: 'Minimize',
  languageLabel: 'Language',
  connecting: 'Connecting...',
  connected: 'Connected',
  disconnected: 'Disconnected. Reconnecting...',
  reconnecting: 'Reconnecting...',
  noAgent: 'No agent available',
  agentTyping: 'Agent is typing...',
  translatedFrom: 'Translated from',
  you: 'You',
  agent: 'Support Agent',
  today: 'Today',
  yesterday: 'Yesterday',
  online: 'Online',
  offline: 'Offline',
  poweredBy: 'Powered by BabelBridge',
  welcomeMessage: 'Hello! How can we help you today?',
  selectLanguage: 'Select your language'
};

export const LocaleProvider = ({ children, apiUrl, initialLang = 'en' }) => {
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [strings, setStrings] = useState(DEFAULT_STRINGS);
  const [loading, setLoading] = useState(false);

  // Use apiUrl or default to production backend
  const API_URL = apiUrl || 'https://babelbridge.onrender.com';

  // Listen for language change events from demo page
  useEffect(() => {
    const handleLangChange = (event) => {
      console.log('[Widget] Language change event received:', event.detail.lang);
      setCurrentLang(event.detail.lang);

      // Also notify socket to change session language
      window.dispatchEvent(new CustomEvent('babelbridge:session-lang-change', {
        detail: { lang: event.detail.lang }
      }));
    };

    window.addEventListener('babelbridge:lang-change', handleLangChange);
    return () => {
      window.removeEventListener('babelbridge:lang-change', handleLangChange);
    };
  }, []);

  useEffect(() => {
    const fetchLocale = async (lang) => {
      if (lang === 'en') {
        setStrings(DEFAULT_STRINGS);
        return;
      }

      setLoading(true);
      try {
        // Fetch from backend API (works in both dev and production)
        const response = await fetch(`${API_URL}/api/locales/widget-${lang}.json`);
        if (response.ok) {
          const localeData = await response.json();
          setStrings(localeData);
          console.log(`[Widget] Loaded ${lang} UI strings from ${API_URL}`);
        } else {
          console.warn(`[Widget] Failed to load ${lang}, using English`);
          setStrings(DEFAULT_STRINGS);
        }
      } catch (error) {
        console.error(`[Widget] Error loading ${lang}:`, error);
        setStrings(DEFAULT_STRINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchLocale(currentLang);
  }, [currentLang, API_URL]);

  const t = (key) => {
    return strings[key] || key;
  };

  const changeLanguage = (lang) => {
    setCurrentLang(lang);

    // Also notify socket to change session language
    window.dispatchEvent(new CustomEvent('babelbridge:session-lang-change', {
      detail: { lang }
    }));
  };

  const value = {
    currentLang,
    strings,
    loading,
    t,
    changeLanguage
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
