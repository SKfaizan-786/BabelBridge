/**
 * Locales Routes
 * Serves localized UI strings for the chat widget
 */

import express from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALES_DIR = join(__dirname, '../../locales');

/**
 * GET /locales/:lang
 * Returns localized UI strings for a specific language
 *
 * Path params:
 *   - lang: Language code (e.g., 'en', 'hi', 'es', 'bn')
 *
 * Returns:
 *   - JSON object with localized strings
 */
router.get('/locales/:lang', async (req, res) => {
  const { lang } = req.params;

  // Validate language code
  if (!config.supportedLanguages.includes(lang)) {
    console.warn(`[Locales] Unsupported language requested: ${lang}`);
    return res.status(400).json({
      error: 'Unsupported language',
      message: `Language '${lang}' is not supported`,
      supportedLanguages: config.supportedLanguages,
    });
  }

  try {
    // Read locale file
    const filePath = join(LOCALES_DIR, `${lang}.json`);
    const content = await readFile(filePath, 'utf-8');
    const localeData = JSON.parse(content);

    console.log(`[Locales] Served ${lang} locale`);

    // Set caching headers (cache for 1 hour)
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(localeData);
  } catch (error) {
    console.error(`[Locales] Error reading locale file for ${lang}:`, error.message);

    // If file doesn't exist, fall back to English
    if (error.code === 'ENOENT') {
      try {
        const fallbackPath = join(LOCALES_DIR, 'en.json');
        const fallbackContent = await readFile(fallbackPath, 'utf-8');
        const fallbackData = JSON.parse(fallbackContent);

        console.log(`[Locales] Falling back to English for ${lang}`);
        res.json(fallbackData);
      } catch (fallbackError) {
        res.status(500).json({
          error: 'Locale not found',
          message: 'Failed to load locale file',
        });
      }
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to load locale file',
      });
    }
  }
});

export default router;
