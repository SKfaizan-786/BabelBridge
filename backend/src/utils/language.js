/**
 * Language Utilities
 * Handles language normalization, detection, and validation
 */

/**
 * Supported languages in BabelBridge
 * These are used across:
 * - UI localization (Lingo)
 * - Runtime translation (LibreTranslate)
 * - Language selector options
 */
export const SUPPORTED_LANGS = ['en', 'hi', 'bn', 'ta', 'es', 'ar', 'zh'];

/**
 * Language metadata for UI display
 */
export const LANG_METADATA = {
  en: { name: 'English', nativeName: 'English', script: 'Latin' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', script: 'Devanagari' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  es: { name: 'Spanish', nativeName: 'Español', script: 'Latin' },
  ar: { name: 'Arabic', nativeName: 'العربية', script: 'Arabic' },
  zh: { name: 'Chinese', nativeName: '中文', script: 'Han' },
};

/**
 * Script detection patterns
 * Used to detect if text matches expected script for a language
 */
const SCRIPT_PATTERNS = {
  Latin: /^[\x00-\x7F\s\p{P}]+$/u,           // ASCII + punctuation
  Devanagari: /[\u0900-\u097F]/,              // Hindi
  Bengali: /[\u0980-\u09FF]/,                 // Bengali
  Tamil: /[\u0B80-\u0BFF]/,                   // Tamil
  Arabic: /[\u0600-\u06FF\u0750-\u077F]/,     // Arabic
  Han: /[\u4E00-\u9FFF\u3400-\u4DBF]/,        // Chinese
};

/**
 * Normalizes a language code to a supported 2-letter code
 * Handles various input formats and always returns a valid language code
 *
 * @param {string|null|undefined} input - Raw language input
 * @param {string} fallback - Fallback language (default: 'en')
 * @returns {string} Normalized 2-letter language code
 *
 * @example
 * normalizeLang('en-US')     // 'en'
 * normalizeLang('hi-IN')     // 'hi'
 * normalizeLang('Hindi')     // 'hi'
 * normalizeLang(null)        // 'en'
 * normalizeLang('unknown')   // 'en'
 */
export function normalizeLang(input, fallback = 'en') {
  // Handle null, undefined, or empty string
  if (!input || typeof input !== 'string') {
    console.warn(`[Language] Invalid language input: ${input}, using fallback: ${fallback}`);
    return fallback;
  }

  // Convert to lowercase and trim
  let normalized = input.toLowerCase().trim();

  // Handle locale codes like 'en-US', 'hi-IN'
  if (normalized.includes('-')) {
    normalized = normalized.split('-')[0];
  }

  // Handle locale codes like 'en_US', 'hi_IN'
  if (normalized.includes('_')) {
    normalized = normalized.split('_')[0];
  }

  // Check if it's a supported language
  if (SUPPORTED_LANGS.includes(normalized)) {
    return normalized;
  }

  // Handle common variants
  const variants = {
    'chinese': 'zh',
    'zh-hans': 'zh',
    'zh-hant': 'zh',
    'cmn': 'zh',
    'arabic': 'ar',
    'arb': 'ar',
    'spanish': 'es',
    'hindi': 'hi',
    'bengali': 'bn',
    'tamil': 'ta',
  };

  if (variants[normalized]) {
    return variants[normalized];
  }

  // If still not found, log warning and return fallback
  console.warn(`[Language] Unsupported language: ${input}, using fallback: ${fallback}`);
  return fallback;
}

/**
 * Detects if text is mostly ASCII (Latin characters)
 * Used to identify cases like Hinglish where user types "mera order"
 * instead of Devanagari script
 *
 * @param {string} text - Text to analyze
 * @param {number} threshold - Percentage threshold (0-1)
 * @returns {boolean} True if >= threshold of characters are ASCII
 *
 * @example
 * isMostlyAscii("Hello world")           // true
 * isMostlyAscii("mera order")            // true
 * isMostlyAscii("मेरा ऑर्डर")             // false
 * isMostlyAscii("Hello मेरा")            // true (>50% ASCII)
 */
export function isMostlyAscii(text, threshold = 0.7) {
  if (!text || text.length === 0) {
    return true; // Empty text is considered ASCII
  }

  // Remove spaces and punctuation for counting
  const alphanumeric = text.replace(/[\s\p{P}]/gu, '');

  if (alphanumeric.length === 0) {
    return true; // Only whitespace/punctuation
  }

  // Count ASCII letters and digits
  const asciiCount = (alphanumeric.match(/[a-zA-Z0-9]/g) || []).length;
  const ratio = asciiCount / alphanumeric.length;

  return ratio >= threshold;
}

/**
 * Detects if text matches the expected script for a language
 *
 * @param {string} text - Text to check
 * @param {string} langCode - Expected language code
 * @returns {boolean} True if text matches expected script
 *
 * @example
 * matchesExpectedScript("Hello", "en")      // true
 * matchesExpectedScript("mera order", "hi") // false (expects Devanagari)
 * matchesExpectedScript("मेरा", "hi")       // true
 */
export function matchesExpectedScript(text, langCode) {
  if (!text || !langCode) return false;

  const metadata = LANG_METADATA[langCode];
  if (!metadata) return false;

  const pattern = SCRIPT_PATTERNS[metadata.script];
  if (!pattern) return false;

  // Remove spaces and punctuation
  const alphanumeric = text.replace(/[\s\p{P}]/gu, '');
  if (alphanumeric.length === 0) return true;

  return pattern.test(text);
}

/**
 * Determines the most likely source language for translation
 * Handles cases like Hinglish where selected language doesn't match text script
 *
 * @param {string} text - Text to analyze
 * @param {string} selectedLang - Language selected by user
 * @returns {string} Recommended source language for translation
 *
 * @example
 * getSourceLang("mera order", "hi")     // "auto" (Hinglish case)
 * getSourceLang("मेरा ऑर्डर", "hi")      // "hi" (correct script)
 * getSourceLang("Hello", "en")          // "en"
 */
export function getSourceLang(text, selectedLang) {
  const normalizedLang = normalizeLang(selectedLang);

  // If selected language is English, use it as-is
  if (normalizedLang === 'en') {
    return 'en';
  }

  // Check if text matches expected script
  const matchesScript = matchesExpectedScript(text, normalizedLang);

  // If text is mostly ASCII but language is non-Latin, use auto-detect
  if (!matchesScript && isMostlyAscii(text)) {
    console.log(`[Language] Text appears to be transliteration (${normalizedLang} selected but ASCII text). Using auto-detect.`);
    return 'auto';
  }

  return normalizedLang;
}

/**
 * Validates if a language code is supported
 *
 * @param {string} langCode - Language code to validate
 * @returns {boolean} True if supported
 */
export function isSupportedLanguage(langCode) {
  return SUPPORTED_LANGS.includes(normalizeLang(langCode));
}

/**
 * Gets safe language code with fallback
 *
 * @param {string} langCode - Language code to validate
 * @param {string} fallback - Fallback language
 * @returns {string} Valid language code
 */
export function getSafeLanguageCode(langCode, fallback = 'en') {
  return isSupportedLanguage(langCode) ? normalizeLang(langCode) : fallback;
}

/**
 * Gets browser language from Accept-Language header or navigator
 *
 * @param {string} acceptLanguage - Accept-Language header value
 * @returns {string} Normalized language code
 */
export function getBrowserLanguage(acceptLanguage) {
  if (!acceptLanguage) {
    return 'en';
  }

  // Parse Accept-Language header: "en-US,en;q=0.9,hi;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim())
    .map(lang => normalizeLang(lang, null))
    .filter(Boolean);

  // Return first supported language
  const supported = languages.find(lang => SUPPORTED_LANGS.includes(lang));
  return supported || 'en';
}
