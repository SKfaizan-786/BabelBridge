/**
 * Generate translations using Google Gemini API
 * This is a direct alternative to Lingo.dev CLI
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const GOOGLE_API_KEY = 'AIzaSyCBqkkYv-FaAwKQlOt0M_ZXgRrrAfMKkSw';
const LANGUAGES = {
  hi: 'Hindi',
  bn: 'Bengali', 
  ta: 'Tamil',
  es: 'Spanish',
  ar: 'Arabic',
  zh: 'Chinese'
};

// Read English source file
const enPath = path.join(__dirname, 'public', 'locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log('🌍 Generating translations using Google Gemini...\n');

// Function to call Google Gemini API
async function translateWithGemini(text, targetLang) {
  return new Promise((resolve, reject) => {
    const prompt = `Translate the following text to ${targetLang}. Keep technical terms like 'BabelBridge', 'API', 'JWT', 'CORS' in English. Maintain the same tone and formality:\n\n${text}`;
    
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.candidates && result.candidates[0]) {
            const translatedText = result.candidates[0].content.parts[0].text.trim();
            resolve(translatedText);
          } else {
            reject(new Error('No translation returned'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Generate translations for all languages
async function generateAllTranslations() {
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    console.log(`📝 Translating to ${langName} (${langCode})...`);
    
    const translated = {};
    
    for (const [key, value] of Object.entries(enData)) {
      try {
        const translatedValue = await translateWithGemini(value, langName);
        translated[key] = translatedValue;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n❌ Error translating "${key}":`, error.message);
        translated[key] = value; // Fallback to English
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Write translated file
    const outputPath = path.join(__dirname, 'public', 'locales', `${langCode}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf8');
    console.log(`\n✅ ${langName} translation saved to ${langCode}.json\n`);
  }
  
  console.log('🎉 All translations generated successfully!');
}

generateAllTranslations().catch(console.error);
