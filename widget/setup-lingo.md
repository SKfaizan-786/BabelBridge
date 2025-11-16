# Lingo.dev CLI Setup Guide

## Step 1: Get API Key

### Option A: Lingo.dev Engine (Recommended)
1. Go to https://lingo.dev/engine
2. Sign up or login
3. Navigate to "Projects" page
4. Click "API key" > "Copy"
5. Set environment variable:
   ```powershell
   $env:LINGODOTDEV_API_KEY="paste-your-key-here"
   ```

### Option B: Use OpenAI (if you have key)
1. Set environment variable:
   ```powershell
   $env:OPENAI_API_KEY="your-openai-key"
   ```
2. Update `i18n.json` - change provider.id from "lingodotdev" to "openai"
3. Add provider.model: "gpt-4o-mini"

## Step 2: Generate Translations

Run this command in the widget directory:
```bash
cd c:\Users\faizan\Documents\BabelBridge\widget
npx lingo.dev@latest run
```

This will:
- Read `public/locales/en.json`
- Generate translations for all 6 target languages (hi, bn, ta, es, ar, zh)
- Create `public/locales/hi.json`, `bn.json`, `ta.json`, etc.
- Create `i18n.lock` file to track translations

## Step 3: Update demo.html

Change the fetch URL from:
```javascript
const response = await fetch(`http://localhost:3000/api/locales/${lang}`);
```

To:
```javascript
const response = await fetch(`/locales/${lang}.json`);
```

That's it! The demo page will now use Lingo.dev-generated translations.

## Useful Commands

- `npx lingo.dev@latest run` - Generate/update all translations
- `npx lingo.dev@latest run --locale hi` - Only translate to Hindi
- `npx lingo.dev@latest run --force` - Force re-translate everything
- `npx lingo.dev@latest validate` - Check for missing translations

