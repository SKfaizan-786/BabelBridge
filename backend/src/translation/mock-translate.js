/**
 * Mock Translation Service - For Development/Demo
 * Simulates translation without external APIs
 */

const mockTranslations = {
  'mera order ka kya hua': 'What happened to my order?',
  'amar order er status ki': 'What is my order status?',
  'hello': 'Hello',
  'hi': 'Hi',
  'thank you': 'Thank you',
  'dhanyawad': 'Thank you',
  'namaste': 'Hello',
  'order': 'Order',
  'status': 'Status',
  'delivery': 'Delivery',
  'help': 'Help'
};

export function mockTranslate(text, from, to) {
  // If translating to English, check if we have a mock
  if (to === 'en') {
    const lowerText = text.toLowerCase().trim();
    if (mockTranslations[lowerText]) {
      return `[MOCK] ${mockTranslations[lowerText]}`;
    }
  }
  
  // If translating from English to other languages
  if (from === 'en') {
    return `[${to.toUpperCase()}] ${text}`;
  }
  
  return `[TRANSLATED] ${text}`;
}