/**
 * Translation Routes
 * @module routes/translation
 */

import { Router, Request, Response } from 'express';
import { translateText, detectLanguage, getSupportedLanguages } from '../services/translation';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/translation/translate
 * Translate text to target language
 */
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'text and targetLanguage are required',
      });
    }

    const source = sourceLanguage || await detectLanguage(text);
    const translated = await translateText(text, source, targetLanguage);

    res.json({
      success: true,
      data: {
        original: text,
        translated,
        sourceLanguage: source,
        targetLanguage,
      },
    });
  } catch (error) {
    logger.error('Error translating text:', error);
    res.status(500).json({ success: false, error: 'Failed to translate text' });
  }
});

/**
 * POST /api/translation/detect
 * Detect language of text
 */
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    const language = await detectLanguage(text);

    res.json({
      success: true,
      data: {
        text,
        detectedLanguage: language,
      },
    });
  } catch (error) {
    logger.error('Error detecting language:', error);
    res.status(500).json({ success: false, error: 'Failed to detect language' });
  }
});

/**
 * GET /api/translation/languages
 * Get list of supported languages
 */
router.get('/languages', async (req: Request, res: Response) => {
  try {
    const languages = await getSupportedLanguages();

    res.json({
      success: true,
      data: languages,
    });
  } catch (error) {
    logger.error('Error fetching languages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch languages' });
  }
});

/**
 * POST /api/translation/batch
 * Translate multiple texts
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'texts (array) and targetLanguage are required',
      });
    }

    const results = await Promise.all(
      texts.map(async (text: string) => {
        const source = sourceLanguage || await detectLanguage(text);
        const translated = await translateText(text, source, targetLanguage);
        return { original: text, translated, sourceLanguage: source };
      })
    );

    res.json({
      success: true,
      data: {
        results,
        targetLanguage,
      },
    });
  } catch (error) {
    logger.error('Error batch translating:', error);
    res.status(500).json({ success: false, error: 'Failed to batch translate' });
  }
});

export default router;

