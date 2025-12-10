/**
 * Tasks Routes
 * @module routes/tasks
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/tasks
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId, status, assignedTo, priority } = req.query;

    let query = supabase
      .from('project_tasks')
      .select('*')
      .order('order_index', { ascending: true });

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);
    if (assignedTo) query = query.eq('assigned_to', assignedTo);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/kanban/:projectId
 * Get tasks grouped by status for Kanban board
 */
router.get('/kanban/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    const kanban = {
      todo: data?.filter(t => t.status === 'todo') || [],
      in_progress: data?.filter(t => t.status === 'in_progress') || [],
      review: data?.filter(t => t.status === 'review') || [],
      done: data?.filter(t => t.status === 'done') || [],
    };

    res.json({ success: true, data: kanban });
  } catch (error) {
    logger.error('Error fetching kanban tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch kanban tasks' });
  }
});

/**
 * POST /api/tasks
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      projectId, title, description, status, priority,
      assignedTo, dueDate, estimatedHours, createdBy
    } = req.body;

    if (!projectId || !title || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'projectId, title, and createdBy are required',
      });
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from('project_tasks')
      .select('order_index')
      .eq('project_id', projectId)
      .eq('status', status || 'todo')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        assigned_to: assignedTo,
        due_date: dueDate,
        estimated_hours: estimatedHours,
        order_index: (maxOrder?.order_index || 0) + 1,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

/**
 * PATCH /api/tasks/:id
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.project_id;
    delete updates.created_by;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

/**
 * PATCH /api/tasks/:id/move
 * Move task to different status column with new order
 */
router.patch('/:id/move', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, orderIndex } = req.body;

    const { data, error } = await supabase
      .from('project_tasks')
      .update({
        status,
        order_index: orderIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error moving task:', error);
    res.status(500).json({ success: false, error: 'Failed to move task' });
  }
});

/**
 * DELETE /api/tasks/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

export default router;

