/**
 * Members Routes
 * Project team member management
 * @module routes/members
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/members/:projectId
 * Get all members of a project
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('project_members')
      .select(`
        *,
        user_profiles (id, full_name, avatar_url, email)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

/**
 * POST /api/members
 * Add a member to a project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, userId, role = 'member', preferredLanguage = 'en' } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'projectId and userId are required',
      });
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'User is already a member of this project',
      });
    }

    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role,
        preferred_language: preferredLanguage,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error adding member:', error);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
});

/**
 * PATCH /api/members/:id
 * Update a member's role or language preference
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, preferredLanguage } = req.body;

    const updates: any = {};
    if (role) updates.role = role;
    if (preferredLanguage) updates.preferred_language = preferredLanguage;

    const { data, error } = await supabase
      .from('project_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating member:', error);
    res.status(500).json({ success: false, error: 'Failed to update member' });
  }
});

/**
 * PATCH /api/members/:id/language
 * Update member's preferred language
 */
router.patch('/:id/language', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { preferredLanguage } = req.body;

    if (!preferredLanguage) {
      return res.status(400).json({
        success: false,
        error: 'preferredLanguage is required',
      });
    }

    const { data, error } = await supabase
      .from('project_members')
      .update({ preferred_language: preferredLanguage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: `Language set to ${preferredLanguage}` });
  } catch (error) {
    logger.error('Error updating language:', error);
    res.status(500).json({ success: false, error: 'Failed to update language' });
  }
});

/**
 * DELETE /api/members/:id
 * Remove a member from a project
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if owner
    const { data: member } = await supabase
      .from('project_members')
      .select('role')
      .eq('id', id)
      .single();

    if (member?.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove project owner. Transfer ownership first.',
      });
    }

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    logger.error('Error removing member:', error);
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
});

export default router;

