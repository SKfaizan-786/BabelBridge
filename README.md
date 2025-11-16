# 🌉 BabelBridge

> **Break language barriers with real-time multilingual customer support**

BabelBridge is a production-ready multilingual support chat system built for hackathons that enables real-time communication between customers and agents across **7 languages** with automatic translation. Customers chat in their native language, agents respond in English, and everything is translated automatically in real-time.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

---

## 🎯 What We Built for This Hackathon

### The Problem
E-commerce platforms and global businesses lose customers due to language barriers. Customer support agents can't respond to queries in Hindi, Bengali, Tamil, or other regional languages effectively.

### Our Solution
BabelBridge provides:
1. **Embeddable Chat Widget** - Add to any website with 3 lines of code
2. **Agent Dashboard** - Real-time chat management for support teams
3. **Automatic Translation** - Powered by LibreTranslate & **Lingo.dev Engine**
4. **7 Language Support** - English, Hindi, Bengali, Tamil, Spanish, Arabic, Chinese
5. **Professional Landing Page** - Complete product showcase

---

## ✨ Key Features

### 🌍 Multilingual Translation Engine
- **7 Languages Supported**: English, Hindi (हिंदी), Bengali (বাংলা), Tamil (தமிழ்), Spanish (Español), Arabic (العربية), Chinese (中文)
- **Real-time Translation**: Messages translated instantly using LibreTranslate API
- **🎯 Lingo.dev Integration**: UI localization powered by [Lingo.dev Engine](https://lingo.dev) for professional-grade translations
- **Hinglish Detection**: Smart handling of transliterated text (e.g., "mera order kaha hai")
- **Bidirectional**: Customer ↔ Agent communication in different languages

### ⚡ Real-time Communication
- **Socket.IO**: WebSocket-based instant messaging
- **Live Session Management**: Track active, waiting, and completed sessions
- **Typing Indicators**: See when the other person is typing
- **Connection Status**: Live connection state monitoring
- **Auto-reconnect**: Resilient connection handling

### 🎨 Beautiful UI/UX
- **Modern Design**: Glassmorphism effects, smooth animations
- **Dark & Light Themes**: User preference persistence
- **Responsive**: Mobile, tablet, desktop optimized
- **Product Landing Page**: Professional marketing page with features, pricing, how-it-works
- **Accessibility**: High contrast, keyboard navigation

### 🚀 Easy Integration
- **Single Script Embed**: 3 lines of code to add to any website
- **Customizable**: Brand colors, theme, position, language
- **Framework Agnostic**: Works with React, WordPress, static HTML, any platform
- **Production Ready**: Built widget is only 163KB gzipped

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Customer      │  (Speaks Hindi)
│   Website       │  Types: "मेरा ऑर्डर कहाँ है?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chat Widget    │  (Embedded on website)
│  - React UI     │  Auto-translates to English
│  - Socket.IO    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Server │  Handles:
│  - Node.js      │  - Translation (LibreTranslate)
│  - Socket.IO    │  - Session management
│  - Express      │  - Message routing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Agent Dashboard │  Agent sees:
│  - React UI     │  "Where is my order?"
│  - Real-time    │  Replies in English
└─────────────────┘
         │
         ▼
    Auto-translates back to Hindi
    Customer sees: "आपका ऑर्डर डिलीवरी में है"
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or yarn
- **(Optional)** Lingo.dev API key for UI translations

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd BabelBridge

# Install all dependencies
cd backend && npm install
cd ../widget && npm install
cd ../dashboard && npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
# Required
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production

# CORS (Add your frontend URLs)
CORS_ORIGINS=http://localhost:5173,http://localhost:5175

# Translation API (Required for runtime translation)
LIBRETRANSLATE_URL=https://libretranslate.com/translate
LIBRETRANSLATE_API_KEY=  # Optional, free tier works

# 🎯 Lingo.dev (Optional - for UI localization only)
LINGODOTDEV_API_KEY=your_lingo_api_key_here
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
🔹 Backend: http://localhost:3000

**Terminal 2 - Widget Demo:**
```bash
cd widget
npm run dev
```
🔹 Widget Demo: http://localhost:5173/demo.html

**Terminal 3 - Agent Dashboard:**
```bash
cd dashboard
npm run dev
```
🔹 Dashboard: http://localhost:5175

### 4. Test It Out!

1. Open **Widget Demo** (http://localhost:5173/demo.html)
2. Open **Agent Dashboard** (http://localhost:5175/dashboard)
3. In widget, select Hindi and type: "मुझे मदद चाहिए"
4. Agent sees English translation: "I need help"
5. Agent replies in English, customer sees Hindi translation!

---

## 🎯 Lingo.dev Integration (UI Localization)

### What is Lingo.dev?

[Lingo.dev](https://lingo.dev) is a developer-first localization platform that provides **AI-powered translations** for your UI. We use it to translate the demo website interface (buttons, labels, navigation) into 7 languages.

### How We Use It

```
Widget UI Text (English)
       ↓
  Lingo.dev CLI
       ↓
7 Language JSON Files
(hi.json, bn.json, ta.json, es.json, ar.json, zh.json)
       ↓
Demo Website Displays UI in User's Language
```

### Setup Lingo.dev (Optional)

1. **Get API Key**: Sign up at [lingo.dev](https://lingo.dev) and get your API key

2. **Add to Environment**:
   ```bash
   # In backend/.env
   LINGODOTDEV_API_KEY=your_api_key_here
   ```

3. **Generate Translations**:
   ```bash
   cd widget
   npx lingo.dev@latest run
   ```

4. **What This Does**:
   - Reads `widget/public/locales/en.json` (English source)
   - Sends to Lingo.dev Engine API
   - Generates translations for all 6 languages
   - Creates `hi.json`, `bn.json`, `ta.json`, `es.json`, `ar.json`, `zh.json`

### Lingo.dev vs LibreTranslate

| Feature | Lingo.dev | LibreTranslate |
|---------|-----------|----------------|
| **Purpose** | UI localization (build-time) | Message translation (runtime) |
| **When Used** | Translating buttons, labels, navigation | Translating customer/agent chat messages |
| **Files** | JSON locale files | N/A (API calls) |
| **Example** | "Send Message" button → "संदेश भेजें" | Customer message → Agent sees English |

**Both work together** to provide complete multilingual support!

---

## 📦 How to Embed on Any Website

### For Hackathon Judges / Website Owners

Add BabelBridge to **any website** (Amazon, Shopify, WordPress, etc.) with just 3 lines:

```html
<!-- Add before </body> tag -->
<link rel="stylesheet" href="https://your-cdn.com/babelbridge/style.css">
<script src="https://your-cdn.com/babelbridge/babelbridge-widget.iife.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    if (window.BabelBridge && window.BabelBridge.init) {
      window.BabelBridge.init({
        apiUrl: 'https://your-backend.com',
        siteKey: 'your-unique-site-id',
        position: 'bottom-right',  // bottom-right, bottom-left
        theme: 'dark',             // dark or light
        primaryColor: '#0ea5e9',   // Your brand color
        lang: 'en'                 // Default language: en, hi, bn, ta, es, ar, zh
      });
    }
  });
</script>
```

### Build the Widget

```bash
cd widget
npm run build
```

Output in `widget/dist/`:
- `babelbridge-widget.iife.js` (529 KB / 163 KB gzipped)
- `style.css` (14 KB / 3 KB gzipped)

Upload these files to your CDN or hosting, then embed!

### Example: Amazon India Integration

```html
<script>
  BabelBridge.init({
    apiUrl: 'https://api.babelbridge.com',
    siteKey: 'amazon-india-store',
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#FF9900',  // Amazon orange
    lang: 'hi'                // Default to Hindi
  });
</script>
```

See [EMBED_GUIDE.md](EMBED_GUIDE.md) for complete embedding documentation.

---

## 🗂️ Project Structure

```
BabelBridge/
├── backend/                    # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── config/            # Environment configuration
│   │   ├── sockets/           # Socket.IO event handlers
│   │   ├── translation/       # LibreTranslate integration
│   │   └── utils/             # Language utilities
│   ├── public/locales/        # UI translations (7 languages)
│   └── index.js               # Server entry point
│
├── widget/                     # React chat widget (customer-facing)
│   ├── src/
│   │   ├── components/        # ChatWidget, MessageList, etc.
│   │   ├── contexts/          # Theme & Socket contexts
│   │   └── styles/            # CSS modules
│   ├── public/locales/        # Lingo.dev generated translations
│   ├── dist/                  # Production build
│   ├── demo.html              # Demo website
│   └── i18n.json              # Lingo.dev configuration
│
├── dashboard/                  # React agent dashboard
│   ├── src/
│   │   ├── components/        # Sidebar, SessionList, ChatArea
│   │   ├── pages/             # LandingPage, DashboardPage
│   │   ├── contexts/          # Theme & Socket contexts
│   │   └── styles/            # CSS modules
│   └── dist/                  # Production build
│
├── logo.jpg                    # Project logo
├── README.md                   # This file
└── EMBED_GUIDE.md              # Embedding documentation
```

---

## 🔑 Required Credentials & APIs

### Required (Free)
1. **LibreTranslate API**
   - URL: https://libretranslate.com
   - Purpose: Runtime message translation
   - Cost: Free tier available (no API key needed)
   - Can self-host: https://github.com/LibreTranslate/LibreTranslate

### Optional (Can Switch Later)
2. **Lingo.dev API** (UI Localization)
   - URL: https://lingo.dev
   - Purpose: Translate demo website UI
   - Cost: Free tier available
   - Alternative: Manual JSON translation files

### Generated Automatically
3. **JWT Secret** - Set in `.env`, used for session tokens
4. **Site Keys** - Generated per website (e.g., 'amazon-store')

### What Can Be Switched Later

✅ **Translation Provider**: Switch from LibreTranslate to:
   - Google Translate API
   - DeepL API
   - AWS Translate
   - Azure Translator

✅ **Database**: Currently in-memory Maps, can add:
   - PostgreSQL for session history
   - Redis for caching
   - MongoDB for message logs

✅ **UI Localization**: Switch from Lingo.dev to:
   - i18next
   - react-intl
   - Manual JSON files

---

## 🌟 Hackathon Highlights

### What Makes This Special

1. **🎯 Lingo.dev Integration**
   - Professional AI-powered UI translations
   - Build-time localization for 7 languages
   - Developer-friendly CLI workflow

2. **🚀 Production Ready**
   - Complete widget build system
   - Embeddable on any website
   - CDN-ready distribution files

3. **🎨 Complete Product Experience**
   - Landing page with features, pricing, how-it-works
   - Agent dashboard with real-time session management
   - Customer widget with language selection

4. **⚡ Real-time Everything**
   - Instant translation
   - Live typing indicators
   - Connection status monitoring
   - Session management

5. **📱 Responsive & Accessible**
   - Mobile-first design
   - Dark/light themes
   - Keyboard navigation
   - High contrast modes

---

## 🧪 Demo Scenarios

### Scenario 1: E-commerce Support (Hindi)
```
Customer (Widget):
  Language: हिंदी
  Types: "मेरा ऑर्डर कहाँ है?"

Agent (Dashboard):
  Sees: "Where is my order?"
  Replies: "Your order is out for delivery"

Customer (Widget):
  Sees: "आपका ऑर्डर डिलीवरी के लिए निकल गया है"
```

### Scenario 2: Global SaaS (Spanish)
```
Customer: "¿Cómo cambio mi contraseña?"
Agent sees: "How do I change my password?"
Agent: "Go to Settings > Security > Change Password"
Customer: "Vaya a Configuración > Seguridad > Cambiar contraseña"
```

### Scenario 3: Multi-session Management
- Open 3 widget tabs (Hindi, Bengali, Tamil)
- Agent dashboard shows all 3 sessions
- Claim and respond to each in English
- All translations happen automatically

---

## 🎨 Customization

### Theme Colors
```css
/* Dark Mode */
:root[data-theme="dark"] {
  --bg-primary: #0a0e27;
  --accent-primary: #0ea5e9;
  --accent-success: #10b981;
}

/* Light Mode */
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --accent-primary: #3b82f6;
  --accent-success: #059669;
}
```

### Widget Configuration
```javascript
BabelBridge.init({
  apiUrl: 'http://localhost:3000',
  siteKey: 'my-website',
  position: 'bottom-right',  // Change position
  theme: 'dark',             // Change theme
  primaryColor: '#FF9900',   // Change brand color
  lang: 'hi'                 // Change default language
});
```

---

## 🐛 Troubleshooting

### Widget Not Connecting
- ✅ Check backend is running on port 3000
- ✅ Verify `CORS_ORIGINS` in `.env` includes widget URL
- ✅ Check browser console for Socket.IO errors

### Translation Not Working
- ✅ Verify `LIBRETRANSLATE_URL` in `.env`
- ✅ Test LibreTranslate API directly
- ✅ Backend falls back to original text if API fails

### Lingo.dev Translations Not Generating
- ✅ Check `LINGODOTDEV_API_KEY` is set
- ✅ Verify `widget/public/locales/en.json` exists
- ✅ Run: `npx lingo.dev@latest run --verbose`

### Dashboard Shows 0 Sessions
- ✅ Backend must be running first
- ✅ Open widget and send a message
- ✅ Check browser console for errors
- ✅ Verify Socket.IO connection in Network tab

---

## 📊 Performance

### Widget Bundle Size
- **Uncompressed**: 529 KB
- **Gzipped**: 163 KB
- **Load Time**: < 1s on 4G

### Backend Performance
- **WebSocket Latency**: < 50ms
- **Translation Time**: 200-500ms (LibreTranslate)
- **Concurrent Sessions**: Tested up to 100

---

## 🚀 Deployment

### Backend
```bash
# Using PM2
pm2 start backend/index.js --name babelbridge-backend

# Or using Docker
docker build -t babelbridge-backend ./backend
docker run -p 3000:3000 babelbridge-backend
```

### Frontend (Widget + Dashboard)
```bash
# Build both
cd widget && npm run build
cd ../dashboard && npm run build

# Upload to hosting
# - widget/dist/ → CDN
# - dashboard/dist/ → Static hosting (Vercel, Netlify, etc.)
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=super-secure-random-string-change-me
CORS_ORIGINS=https://yourdomain.com,https://dashboard.yourdomain.com
LIBRETRANSLATE_URL=https://libretranslate.com/translate
```

---

## 🎯 Future Enhancements (Post-Hackathon)

- [ ] **Database Integration** - PostgreSQL for session/message history
- [ ] **Agent Authentication** - Login system for agents
- [ ] **File Uploads** - Support images in chat
- [ ] **Voice Messages** - Audio message support
- [ ] **Analytics Dashboard** - Session metrics, response times
- [ ] **Email Notifications** - Alert agents of new sessions
- [ ] **More Languages** - Expand beyond 7 languages
- [ ] **AI Auto-responses** - GPT integration for common queries
- [ ] **Mobile Apps** - Native iOS/Android agent apps

---

## 🙏 Credits & Acknowledgments

### Technologies Used
- **React** - UI framework
- **Socket.IO** - Real-time communication
- **Express** - Backend server
- **Vite** - Build tool
- **LibreTranslate** - Translation API
- **🎯 Lingo.dev** - UI localization platform

### Built By
Team BabelBridge for [Hackathon Name]

---

## 📄 License

MIT License - Feel free to use this for your projects!

---

## 📞 Support & Contact

- **Documentation**: See [EMBED_GUIDE.md](EMBED_GUIDE.md)
- **Issues**: Open a GitHub issue
- **Demo**: http://localhost:5173/demo.html (after setup)

---

**🌉 Built with ❤️ to break language barriers and connect the world** 🌍

*"Because everyone deserves support in their own language"*
