/**
 * Translation Service
 * Uses Google Cloud Translation API
 * @module services/translation
 */

import { Translate } from '@google-cloud/translate/build/src/v2';
import crypto from 'crypto';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

// Initialize Google Translate client
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

/**
 * Supported languages with display names
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'id', name: 'Indonesian' },
];

/**
 * Generate hash for caching
 */
function generateHash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * Check translation cache
 */
async function checkCache(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string | null> {
  const hash = generateHash(text);

  const { data } = await supabase
    .from('translation_cache')
    .select('translated_text')
    .eq('source_text_hash', hash)
    .eq('source_language', sourceLanguage)
    .eq('target_language', targetLanguage)
    .single();

  return data?.translated_text || null;
}

/**
 * Save translation to cache
 */
async function saveToCache(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  translatedText: string
): Promise<void> {
  const hash = generateHash(text);

  try {
    await supabase.from('translation_cache').upsert({
      source_text_hash: hash,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      translated_text: translatedText,
    });
  } catch (error) {
    logger.warn('Failed to cache translation:', error);
  }
}

/**
 * Translate text to target language
 * 
 * @param text - Text to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguage - Target language code
 * @returns Translated text
 * 
 * @example
 * const spanish = await translateText('Hello, how are you?', 'en', 'es');
 * // Returns: 'Hola, ¿cómo estás?'
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // Return original if same language
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // Check cache first
  const cached = await checkCache(text, sourceLanguage, targetLanguage);
  if (cached) {
    logger.debug('Translation cache hit');
    return cached;
  }

  try {
    // Use Google Translate API
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    // Cache the result
    await saveToCache(text, sourceLanguage, targetLanguage, translation);

    return translation;
  } catch (error) {
    logger.error('Translation API error:', error);
    throw new Error('Translation failed');
  }
}

/**
 * Detect language of text
 * 
 * @param text - Text to detect language of
 * @returns Language code
 * 
 * @example
 * const lang = await detectLanguage('Hola, ¿cómo estás?');
 * // Returns: 'es'
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    logger.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

/**
 * Get list of supported languages
 * 
 * @returns Array of supported languages with codes and names
 */
export async function getSupportedLanguages(): Promise<typeof SUPPORTED_LANGUAGES> {
  return SUPPORTED_LANGUAGES;
}

/**
 * Translate text to multiple languages at once
 * 
 * @param text - Text to translate
 * @param sourceLanguage - Source language code
 * @param targetLanguages - Array of target language codes
 * @returns Object mapping language codes to translations
 */
export async function translateToMultiple(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.all(
    targetLanguages.map(async (targetLang) => {
      try {
        const translated = await translateText(text, sourceLanguage, targetLang);
        results[targetLang] = translated;
      } catch (error) {
        logger.warn(`Failed to translate to ${targetLang}:`, error);
        results[targetLang] = text; // Fallback to original
      }
    })
  );

  return results;
}

export default {
  translateText,
  detectLanguage,
  getSupportedLanguages,
  translateToMultiple,
  SUPPORTED_LANGUAGES,
};

