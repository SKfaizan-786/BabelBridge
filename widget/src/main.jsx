import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import './styles/global.css';

window.BabelBridge = {
  init: function(config = {}) {
    const {
      apiUrl = 'https://babelbridge.onrender.com',
      position = 'bottom-right',
      theme = 'dark',
      primaryColor = '#0ea5e9',
      lang = 'en'
    } = config;

    // Create container
    const container = document.createElement('div');
    container.id = 'babelbridge-widget-container';
    document.body.appendChild(container);

    // Render widget (removed StrictMode to prevent double renders)
    const root = ReactDOM.createRoot(container);
    root.render(
      <ChatWidget
        apiUrl={apiUrl}
        position={position}
        theme={theme}
        primaryColor={primaryColor}
        lang={lang}
      />
    );
  }
};

// Auto-init if data attributes present
if (document.currentScript) {
  const script = document.currentScript;
  if (script.dataset.autoinit !== 'false') {
    window.BabelBridge.init({
      apiUrl: script.dataset.apiUrl,
      position: script.dataset.position,
      theme: script.dataset.theme,
      primaryColor: script.dataset.primaryColor,
      lang: script.dataset.lang
    });
  }
}
