import React from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useLocale } from '../contexts/LocaleContext';
import '../styles/LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh', name: 'Chinese', native: '中文' }
];

const LanguageSelector = ({ currentLang, onClose }) => {
  const { changeLanguage: changeSocketLanguage } = useSocket();
  const { changeLanguage: changeLocaleLanguage, t } = useLocale();

  const handleLanguageChange = (langCode) => {
    // Update both socket language (for message translation) and UI language
    changeSocketLanguage(langCode);
    changeLocaleLanguage(langCode);
    onClose();
  };

  return (
    <div className="language-selector">
      <div className="language-selector-header">
        <h4 className="language-selector-title">{t('selectLanguage')}</h4>
        <button className="language-selector-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="language-list">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={`language-item ${currentLang === lang.code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <div className="language-info">
              <span className="language-name">{lang.name}</span>
              <span className="language-native">{lang.native}</span>
            </div>
            {currentLang === lang.code && (
              <svg className="language-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
