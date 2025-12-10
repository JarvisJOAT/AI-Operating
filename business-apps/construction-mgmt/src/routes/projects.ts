/**
 * Projects Routes
 * @module routes/projects
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/projects
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { organizationId, status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('construction_projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, pagination: { total: count, limit: Number(limit), offset: Number(offset) } });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('construction_projects')
      .select(`
        *,
        project_tasks (count),
        project_members (*),
        expenses (amount)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Project not found' });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

/**
 * POST /api/projects
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      organizationId, name, description, startDate, endDate,
      budget, address, clientName, clientPhone, clientEmail, createdBy
    } = req.body;

    if (!organizationId || !name || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'organizationId, name, and createdBy are required',
      });
    }

    const { data, error } = await supabase
      .from('construction_projects')
      .insert({
        organization_id: organizationId,
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget: budget || 0,
        address,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as project owner
    await supabase.from('project_members').insert({
      project_id: data.id,
      user_id: createdBy,
      role: 'owner',
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

/**
 * PATCH /api/projects/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.organization_id;
    delete updates.created_by;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('construction_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('construction_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

/**
 * GET /api/projects/:id/stats
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get project
    const { data: project } = await supabase
      .from('construction_projects')
      .select('budget, spent')
      .eq('id', id)
      .single();

    // Get task counts
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('status')
      .eq('project_id', id);

    // Get total expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .eq('project_id', id);

    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const taskStats = {
      total: tasks?.length || 0,
      todo: tasks?.filter(t => t.status === 'todo').length || 0,
      inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      review: tasks?.filter(t => t.status === 'review').length || 0,
      done: tasks?.filter(t => t.status === 'done').length || 0,
    };

    res.json({
      success: true,
      data: {
        budget: project?.budget || 0,
        spent: totalExpenses,
        remaining: (project?.budget || 0) - totalExpenses,
        tasks: taskStats,
        completionPercentage: taskStats.total > 0 
          ? Math.round((taskStats.done / taskStats.total) * 100) 
          : 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching project stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project stats' });
  }
});

export default router;

