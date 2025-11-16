/**
 * Generate widget UI translations
 * Uses Google Translate API (free)
 */

import { translate } from '@vitalets/google-translate-api';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGUAGES = {
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  es: 'Spanish',
  ar: 'Arabic',
  zh: 'Chinese'
};

// Read English widget strings
const enPath = path.join(__dirname, '../widget/public/locales/widget-en.json');
const enData = JSON.parse(await fs.readFile(enPath, 'utf8'));

console.log('🌍 Generating widget UI translations...\n');

for (const [langCode, langName] of Object.entries(LANGUAGES)) {
  console.log(`📝 Translating to ${langName} (${langCode})...`);
  
  const translated = {};
  
  for (const [key, value] of Object.entries(enData)) {
    try {
      const result = await translate(value, { from: 'en', to: langCode });
      translated[key] = result.text;
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n❌ Error translating "${key}":`, error.message);
      translated[key] = value;
    }
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Write file
  const outputPath = path.join(__dirname, '../widget/public/locales', `widget-${langCode}.json`);
  await fs.writeFile(outputPath, JSON.stringify(translated, null, 2), 'utf8');
  console.log(`\n✅ ${langName} saved to widget-${langCode}.json\n`);
}

console.log('🎉 Widget translations complete!');
