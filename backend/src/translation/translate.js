/**
 * Translation Service - BabelBridge (Hackathon Version)
 * Simple Google Translate with aggressive caching and pattern matching
 */

import { translate } from '@vitalets/google-translate-api';
import {
  normalizeLang,
  isMostlyAscii,
} from '../utils/language.js';

// Simple translation cache (in-memory, 2000 entries max for hackathon)
const translationCache = new Map();
const MAX_CACHE_SIZE = 2000;

// Option 3: Comprehensive offline translation database (100% reliable backup)
const offlineTranslations = {
  // English to Hindi
  'en->hi': {
    'hello': 'नमस्ते',
    'hi': 'नमस्ते',
    'thank you': 'धन्यवाद',
    'thanks': 'धन्यवाद',
    'order': 'ऑर्डर',
    'status': 'स्थिति',
    'delivery': 'डिलीवरी',
    'delivered': 'डिलीवर हो गया',
    'yes': 'हाँ',
    'no': 'नहीं',
    'help': 'मदद',
    'support': 'सहायता',
    'when will my order come': 'मेरा ऑर्डर कब आएगा',
    'what is my order status': 'मेरे ऑर्डर की क्या स्थिति है',
    'what is the order status': 'ऑर्डर की क्या स्थिति है',
    'track my order': 'मेरे ऑर्डर को ट्रैक करें',
    'cancel my order': 'मेरा ऑर्डर रद्द करें',
    'where is my order': 'मेरा ऑर्डर कहाँ है',
    'i need help': 'मुझे मदद चाहिए',
    'order not received': 'ऑर्डर नहीं मिला',
    'refund request': 'रिफंड की अनुरोध',
    'payment issue': 'भुगतान की समस्या',
    'product damaged': 'उत्पाद क्षतिग्रस्त'
  },
  
  // English to Bengali
  'en->bn': {
    'hello': 'হ্যালো',
    'hi': 'হাই',
    'thank you': 'ধন্যবাদ',
    'thanks': 'ধন্যবাদ',
    'order': 'অর্ডার',
    'status': 'অবস্থা',
    'delivery': 'ডেলিভারি',
    'delivered': 'ডেলিভার হয়েছে',
    'yes': 'হ্যাঁ',
    'no': 'না',
    'help': 'সাহায্য',
    'support': 'সহায়তা',
    'when will my order come': 'আমার অর্ডার কখন আসবে',
    'what is my order status': 'আমার অর্ডারের স্ট্যাটাস কী',
    'what is the order status': 'অর্ডারের স্ট্যাটাস কী',
    'track my order': 'আমার অর্ডার ট্র্যাক করুন',
    'cancel my order': 'আমার অর্ডার বাতিল করুন',
    'where is my order': 'আমার অর্ডার কোথায়',
    'i need help': 'আমার সাহায্য দরকার'
  },
  
  // Hindi/Bengali transliteration to English (CRITICAL FOR DEMO)
  'auto->en': {
    // Greetings & basics
    'hello': 'Hello',
    'helloo': 'Hello',
    'hellooo': 'Hello',
    'hi': 'Hi',
    'hii': 'Hi',
    'namaste': 'Hello',
    'namaskar': 'Hello',
    'dhanyawad': 'Thank you',
    'dhanyabad': 'Thank you',
    'dhonnobad': 'Thank you',
    'shukriya': 'Thank you',
    
    // Common phrases (complete sentences) - EXACT MATCHES FIRST
    'mera order ka status kya hai': 'What is my order status?',
    'mera order ka status kya hain': 'What is my order status?',
    'mera order status kya hai': 'What is my order status?',
    'order ka status kya hai': 'What is the order status?',
    'order status kya hai': 'What is the order status?',
    'mera order kab tak aeyga': 'When will my order arrive?',
    'mera order kab ayega': 'When will my order arrive?',
    'mera order kab tak ayega': 'When will my order arrive?',
    'amar order kobe ashbe': 'When will my order arrive?',
    'amar order er status ki': 'What is my order status?',
    'mera order kaha hai': 'Where is my order?',
    'order track karna hai': 'I want to track my order',
    'order cancel karna hai': 'I want to cancel my order',
    'refund chahiye': 'I want a refund',
    'paisa wapas chahiye': 'I want money back',
    'product kharab hai': 'Product is damaged',
    'delivery nahi hui': 'Delivery not received',
    'help chahiye': 'I need help',
    'problem hai': 'There is a problem',
    
    // Individual words & phrases
    'mera': 'my',
    'amar': 'my',
    'order': 'order',
    'kab': 'when',
    'kobe': 'when', 
    'kab tak': 'when will',
    'kya': 'what',
    'ki': 'what',
    'kya hua': 'what happened',
    'kaise hai': 'how is',
    'kaha': 'where',
    'kothay': 'where',
    'ayega': 'will come',
    'aeyga': 'will come',
    'ashbe': 'will come',
    'hoga': 'will be',
    'hobe': 'will be',
    'milega': 'will get',
    'pabo': 'will get',
    'chahiye': 'need',
    'dorkar': 'need',
    'status': 'status',
    'delivery': 'delivery',
    'track': 'track',
    'cancel': 'cancel',
    'return': 'return',
    'refund': 'refund',
    'problem': 'problem',
    'issue': 'issue',
    'help': 'help',
    'support': 'support',
    'payment': 'payment',
    'paisa': 'money',
    'taka': 'money',
    'product': 'product',
    'item': 'item',
    'samaan': 'item'
  }
};

// Smart pattern matching for comprehensive phrases
const commonPhrases = offlineTranslations;

/**
 * Advanced offline translation (Option 3) - handles complex sentences
 */
function advancedOfflineTranslate(text, from, to) {
  const key = `${from}->${to}`;
  const translations = offlineTranslations[key];
  
  if (!translations) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Direct exact match first
  if (translations[lowerText]) {
    return translations[lowerText];
  }
  
  // Fuzzy matching for similar phrases
  for (const [phrase, translation] of Object.entries(translations)) {
    if (phrase.length > 10) { // Only for longer phrases
      const similarity = calculateSimilarity(lowerText, phrase);
      if (similarity > 0.8) {
        return translation;
      }
    }
  }
  
  return null;
}

/**
 * Simple similarity calculation for fuzzy matching
 */
function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  return (commonWords.length * 2) / (words1.length + words2.length);
}

/**
 * Smart pattern-based translation - prioritizes complete phrases
 */
function translateWithPatterns(text, from, to) {
  const key = `${from}->${to}`;
  const patterns = commonPhrases[key];
  
  if (!patterns) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // PRIORITY 1: Exact complete phrase match
  if (patterns[lowerText]) {
    return patterns[lowerText];
  }
  
  // PRIORITY 2: Fuzzy complete phrase match (for slight variations)
  if (from === 'auto' && to === 'en') {
    for (const [phrase, translation] of Object.entries(patterns)) {
      // Only check longer phrases (5+ words) for fuzzy matching
      if (phrase.split(' ').length >= 4) {
        const similarity = calculateSimilarity(lowerText, phrase);
        if (similarity > 0.75) {
          return translation;
        }
      }
    }
  }
  
  // PRIORITY 3: Substring matching for complete phrases
  if (from === 'auto' && to === 'en') {
    // Sort patterns by length (longest first) to match complete phrases before individual words
    const sortedPatterns = Object.entries(patterns)
      .filter(([phrase]) => phrase.split(' ').length >= 4)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [phrase, translation] of sortedPatterns) {
      if (lowerText.includes(phrase) || phrase.includes(lowerText)) {
        return translation;
      }
    }
  }
  
  // PRIORITY 4: Word-by-word only for short texts (3 words or less)
  if (from === 'auto' && to === 'en' && lowerText.split(' ').length <= 3) {
    let translatedWords = [];
    const words = lowerText.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      let matched = false;
      
      // Try 2-word combinations first
      if (i < words.length - 1) {
        const twoWords = `${words[i]} ${words[i + 1]}`;
        if (patterns[twoWords]) {
          translatedWords.push(patterns[twoWords]);
          i++; // Skip next word as it's part of this match
          matched = true;
        }
      }
      
      // Try single word if no 2-word match
      if (!matched && patterns[words[i]]) {
        translatedWords.push(patterns[words[i]]);
        matched = true;
      }
      
      // Keep original word if no translation found
      if (!matched) {
        translatedWords.push(words[i]);
      }
    }
    
    return translatedWords.join(' ');
  }
  
  return null;
}

/**
 * Option 1: Direct Google Translate Scraping (bypasses API limits)
 */
async function scrapeGoogleTranslate(text, from, to) {
  try {
    const fromLang = from === 'auto' ? 'auto' : from;
    const url = `https://translate.google.com/m?hl=${to}&sl=${fromLang}&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract translation from HTML using regex
    const matches = html.match(/<div[^>]*class="result-container"[^>]*>(.*?)<\/div>/s) ||
                   html.match(/class="t0">(.*?)<\/div>/s) ||
                   html.match(/div[^>]*>([^<]*(?:<[^>]*>[^<]*)*?)<\/div>/s);

    if (matches && matches[1]) {
      let translation = matches[1]
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      return translation || null;
    }

    throw new Error('Could not extract translation from HTML');
  } catch (error) {
    console.error('[Translation] Google Scraping error:', error.message);
    return null;
  }
}

/**
 * Option 1 Fallback: Google Translate API (rate limited)
 */
async function translateWithGoogle(text, from, to, retryCount = 0) {
  try {
    // Add small delay to avoid rate limiting
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
    
    const result = await translate(text, { from, to });
    return result.text;
  } catch (error) {
    console.error(`[Translation] Google API error (attempt ${retryCount + 1}):`, error.message);
    
    // Don't retry API if we have scraping - just fail fast
    return null;
  }
}

/**
 * Generate cache key for translation
 */
function getCacheKey(text, from, to) {
  return `${from}:${to}:${text}`;
}

/**
 * Main translation function with Hinglish detection and caching
 */
export async function translateMessage({ text, from, to, selectedLang }) {
  const normalizedFrom = normalizeLang(from, 'auto');
  const normalizedTo = normalizeLang(to, 'en');
  const normalizedSelected = normalizeLang(selectedLang, 'en');

  // No translation needed if same language
  if (normalizedFrom === normalizedTo && normalizedFrom !== 'auto') {
    return text;
  }

  // Apply Hinglish heuristic
  let effectiveFrom = normalizedFrom;
  if (normalizedSelected !== 'en' && isMostlyAscii(text)) {
    console.log(`[Language] Text appears to be transliteration (${normalizedSelected} selected but ASCII text). Using auto-detect.`);
    effectiveFrom = 'auto';
  }

  console.log(`[Translation] ${effectiveFrom} -> ${normalizedTo}: "${text.substring(0, 50)}..."`);

  // Check cache first
  const cacheKey = getCacheKey(text, effectiveFrom, normalizedTo);
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey);
    console.log(`[Translation] Cache hit: "${cached.substring(0, 50)}..."`);
    return cached;
  }

  // Try simple pattern matching first (instant, no API calls)
  let translated = translateWithPatterns(text, effectiveFrom, normalizedTo);
  if (translated) {
    console.log(`[Translation] Pattern match: "${translated.substring(0, 50)}..."`);
    
    // Cache the successful translation
    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);
    
    return translated;
  }

  // Try Google Scraping (Option 1 - bypasses API limits)
  translated = await scrapeGoogleTranslate(text, effectiveFrom, normalizedTo);
  
  if (translated) {
    console.log(`[Translation] Google Scraping Success: "${translated.substring(0, 50)}..."`);
    
    // Cache the successful translation
    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);
    
    return translated;
  }

  // Fallback to Google API (Option 1 backup)
  console.log('[Translation] Google scraping failed, trying Google API...');
  translated = await translateWithGoogle(text, effectiveFrom, normalizedTo);

  if (translated) {
    console.log(`[Translation] Google API Success: "${translated.substring(0, 50)}..."`);
    
    // Cache the successful translation
    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);
    
    return translated;
  }

  // Option 3 - Advanced offline fallback for common sentences
  console.log('[Translation] All online services failed, using advanced offline matching...');
  translated = advancedOfflineTranslate(text, effectiveFrom, normalizedTo);
  
  if (translated) {
    console.log(`[Translation] Advanced Offline Success: "${translated.substring(0, 50)}..."`);
    
    // Cache the successful translation
    if (translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }
    translationCache.set(cacheKey, translated);
    
    return translated;
  }

  // Final fallback to original text
  console.log('[Translation] All methods failed, keeping original text');
  return text;
}

/**
 * Helper: Translate user message to agent (English)
 */
export async function translateUserToAgent(text, userLang) {
  return translateMessage({
    text,
    from: userLang,
    to: 'en',
    selectedLang: userLang,
  });
}

/**
 * Helper: Translate agent message to user language
 */
export async function translateAgentToUser(text, userLang) {
  const normalizedLang = normalizeLang(userLang, 'en');

  // No translation if user is English
  if (normalizedLang === 'en') {
    return text;
  }

  return translateMessage({
    text,
    from: 'en',
    to: normalizedLang,
    selectedLang: normalizedLang,
  });
}
