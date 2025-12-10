/**
 * Messages Routes
 * Real-time messaging with translation
 * @module routes/messages
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { translateText, detectLanguage } from '../services/translation';

const router = Router();

/**
 * GET /api/messages/:projectId
 * Get messages for a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;

    let query = supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Reverse to get chronological order
    res.json({ success: true, data: data?.reverse() || [] });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, senderId, content, replyTo } = req.body;

    if (!projectId || !senderId || !content) {
      return res.status(400).json({
        success: false,
        error: 'projectId, senderId, and content are required',
      });
    }

    // Detect original language
    const originalLanguage = await detectLanguage(content);

    // Get project members and their language preferences
    const { data: members } = await supabase
      .from('project_members')
      .select('user_id, preferred_language')
      .eq('project_id', projectId);

    // Get unique target languages
    const targetLanguages = [...new Set(
      members
        ?.map(m => m.preferred_language)
        .filter(lang => lang && lang !== originalLanguage) || []
    )];

    // Generate translations
    const translations: Record<string, string> = {};
    for (const targetLang of targetLanguages) {
      try {
        const translated = await translateText(content, originalLanguage, targetLang);
        translations[targetLang] = translated;
      } catch (err) {
        logger.warn(`Failed to translate to ${targetLang}:`, err);
      }
    }

    // Save message
    const { data, error } = await supabase
      .from('project_messages')
      .insert({
        project_id: projectId,
        sender_id: senderId,
        content,
        original_language: originalLanguage,
        translations,
        reply_to: replyTo,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/:projectId/:messageId/translate
 * Get a message translated to a specific language
 */
router.get('/:projectId/:messageId/translate', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { targetLanguage } = req.query;

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'targetLanguage is required',
      });
    }

    // Get message
    const { data: message, error } = await supabase
      .from('project_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error || !message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    // Check if translation already exists
    const existingTranslation = message.translations?.[targetLanguage as string];
    if (existingTranslation) {
      return res.json({
        success: true,
        data: {
          original: message.content,
          translated: existingTranslation,
          originalLanguage: message.original_language,
          targetLanguage,
        },
      });
    }

    // Generate new translation
    const translated = await translateText(
      message.content,
      message.original_language,
      targetLanguage as string
    );

    // Cache the translation
    const updatedTranslations = {
      ...message.translations,
      [targetLanguage as string]: translated,
    };

    await supabase
      .from('project_messages')
      .update({ translations: updatedTranslations })
      .eq('id', messageId);

    res.json({
      success: true,
      data: {
        original: message.content,
        translated,
        originalLanguage: message.original_language,
        targetLanguage,
      },
    });
  } catch (error) {
    logger.error('Error translating message:', error);
    res.status(500).json({ success: false, error: 'Failed to translate message' });
  }
});

/**
 * PATCH /api/messages/:id
 * Edit a message
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, senderId } = req.body;

    // Verify sender
    const { data: existing } = await supabase
      .from('project_messages')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (existing?.sender_id !== senderId) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own messages',
      });
    }

    // Detect language and regenerate translations
    const originalLanguage = await detectLanguage(content);
    
    // Clear old translations (they'll be regenerated on demand)
    const { data, error } = await supabase
      .from('project_messages')
      .update({
        content,
        original_language: originalLanguage,
        translations: {},
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(500).json({ success: false, error: 'Failed to edit message' });
  }
});

/**
 * DELETE /api/messages/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { senderId } = req.body;

    // Verify sender
    const { data: existing } = await supabase
      .from('project_messages')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (existing?.sender_id !== senderId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own messages',
      });
    }

    const { error } = await supabase
      .from('project_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

export default router;

