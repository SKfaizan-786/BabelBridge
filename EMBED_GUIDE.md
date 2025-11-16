# BabelBridge Widget - Embedding Guide

## Quick Start

Add the BabelBridge chat widget to your website in just 2 steps:

### Step 1: Add the Script

Add this code snippet just before the closing `</body>` tag of your HTML:

```html
<!-- BabelBridge Chat Widget -->
<script src="https://your-cdn.com/babelbridge-widget.iife.js"></script>
<script>
  BabelBridge.init({
    apiUrl: 'https://your-backend.com',    // Your BabelBridge backend URL
    siteKey: 'your-unique-site-key',       // Unique identifier for your site
    position: 'bottom-right',              // Widget position (optional)
    theme: 'dark',                         // 'dark' or 'light' (optional)
    primaryColor: '#0ea5e9',               // Brand color (optional)
    lang: 'en'                             // Default language (optional)
  });
</script>
```

### Step 2: Customize (Optional)

Customize the widget to match your brand:

```html
<script>
  BabelBridge.init({
    apiUrl: 'https://api.yourdomain.com',
    siteKey: 'amazon-store-main',
    position: 'bottom-right',              // 'bottom-right' or 'bottom-left'
    theme: 'light',                        // Match your website theme
    primaryColor: '#FF9900',               // Amazon's orange color
    lang: 'en'                             // 'en', 'hi', 'bn', 'ta', 'es', 'ar', 'zh'
  });
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | **required** | Your BabelBridge backend server URL |
| `siteKey` | string | **required** | Unique identifier for your website |
| `position` | string | `'bottom-right'` | Widget position: `'bottom-right'` or `'bottom-left'` |
| `theme` | string | `'dark'` | Widget theme: `'dark'` or `'light'` |
| `primaryColor` | string | `'#0ea5e9'` | Primary brand color (hex code) |
| `lang` | string | `'en'` | Default language: `'en'`, `'hi'`, `'bn'`, `'ta'`, `'es'`, `'ar'`, `'zh'` |

## Supported Languages

BabelBridge supports 7 languages with automatic translation:

- 🇺🇸 **English** (`en`)
- 🇮🇳 **Hindi** (`hi`) - हिंदी
- 🇮🇳 **Bengali** (`bn`) - বাংলা
- 🇮🇳 **Tamil** (`ta`) - தமிழ்
- 🇪🇸 **Spanish** (`es`) - Español
- 🇸🇦 **Arabic** (`ar`) - العربية
- 🇨🇳 **Chinese** (`zh`) - 中文

## Real-World Examples

### E-commerce Store (Amazon-style)

```html
<script src="https://cdn.babelbridge.com/widget.js"></script>
<script>
  BabelBridge.init({
    apiUrl: 'https://api.babelbridge.com',
    siteKey: 'amazon-india-store',
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#FF9900',
    lang: 'hi'  // Default to Hindi for India
  });
</script>
```

### SaaS Platform

```html
<script src="https://cdn.babelbridge.com/widget.js"></script>
<script>
  BabelBridge.init({
    apiUrl: 'https://api.babelbridge.com',
    siteKey: 'my-saas-platform',
    position: 'bottom-right',
    theme: 'dark',
    primaryColor: '#6366f1',
    lang: 'en'
  });
</script>
```

### Travel Website

```html
<script src="https://cdn.babelbridge.com/widget.js"></script>
<script>
  BabelBridge.init({
    apiUrl: 'https://api.babelbridge.com',
    siteKey: 'global-travel-site',
    position: 'bottom-left',
    theme: 'light',
    primaryColor: '#10b981',
    lang: 'es'  // Spanish for Latin America
  });
</script>
```

## Building the Widget

To build the embeddable widget file:

```bash
cd widget
npm run build
```

This creates `dist/babelbridge-widget.iife.js` which you can host on your CDN or server.

## Local Development & Testing

For local testing, you can use the demo.html file:

```bash
cd widget
npm run dev
```

Then visit `http://localhost:5173/demo.html`

## How It Works

1. **Customer visits your website** - Widget loads in their preferred language
2. **Customer sends message** - Message is automatically translated to English for your agents
3. **Agent responds in English** - Response is automatically translated back to customer's language
4. **Seamless conversation** - Both parties communicate in their native language

## Advanced: Dynamic Language Detection

You can auto-detect the user's browser language:

```html
<script>
  const browserLang = navigator.language.split('-')[0];
  const supportedLangs = ['en', 'hi', 'bn', 'ta', 'es', 'ar', 'zh'];
  const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en';

  BabelBridge.init({
    apiUrl: 'https://api.babelbridge.com',
    siteKey: 'my-website',
    lang: defaultLang  // Auto-detect language
  });
</script>
```

## Support

For questions or issues:
- GitHub: https://github.com/yourusername/babelbridge
- Documentation: https://babelbridge.com/docs
- Email: support@babelbridge.com
