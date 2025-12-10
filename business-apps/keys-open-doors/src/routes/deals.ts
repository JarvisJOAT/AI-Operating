/**
 * Deals Routes
 * 
 * API endpoints for managing scraped real estate deals.
 * 
 * @module routes/deals
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/deals
 * List all scraped deals with filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      limit = 20,
      offset = 0,
      state,
      city,
      minPrice,
      maxPrice,
      isPosted,
      isApproved,
      search,
      sortBy = 'scraped_at',
      sortOrder = 'desc',
    } = req.query;

    let query = supabase
      .from('scraped_deals')
      .select('*', { count: 'exact' });

    // Apply filters
    if (state) query = query.eq('state', state);
    if (city) query = query.eq('city', city);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (isPosted !== undefined) query = query.eq('is_posted', isPosted === 'true');
    if (isApproved !== undefined) query = query.eq('is_approved', isApproved === 'true');
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(String(sortBy), { ascending: sortOrder === 'asc' })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    logger.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deals',
    });
  }
});

/**
 * GET /api/deals/stats
 * Get deal statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { data: total, error: totalError } = await supabase
      .from('scraped_deals')
      .select('id', { count: 'exact', head: true });

    const { data: posted, error: postedError } = await supabase
      .from('scraped_deals')
      .select('id', { count: 'exact', head: true })
      .eq('is_posted', true);

    const { data: pending, error: pendingError } = await supabase
      .from('scraped_deals')
      .select('id', { count: 'exact', head: true })
      .eq('is_posted', false)
      .eq('is_approved', true);

    const { data: awaiting, error: awaitingError } = await supabase
      .from('scraped_deals')
      .select('id', { count: 'exact', head: true })
      .eq('is_approved', false);

    if (totalError || postedError || pendingError || awaitingError) {
      throw new Error('Failed to fetch stats');
    }

    res.json({
      success: true,
      data: {
        total: total?.length || 0,
        posted: posted?.length || 0,
        pendingPost: pending?.length || 0,
        awaitingApproval: awaiting?.length || 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching deal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deal statistics',
    });
  }
});

/**
 * GET /api/deals/:id
 * Get a specific deal
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('scraped_deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error fetching deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deal',
    });
  }
});

/**
 * PATCH /api/deals/:id
 * Update a deal
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.organization_id;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('scraped_deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deal',
    });
  }
});

/**
 * POST /api/deals/:id/approve
 * Approve a deal for posting
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const { data, error } = await supabase
      .from('scraped_deals')
      .update({
        is_approved: true,
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'Deal approved for posting',
    });
  } catch (error) {
    logger.error('Error approving deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve deal',
    });
  }
});

/**
 * POST /api/deals/:id/reject
 * Reject a deal (mark as not for posting)
 */
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('scraped_deals')
      .update({
        is_approved: false,
        approved_by: null,
        approved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'Deal rejected',
    });
  } catch (error) {
    logger.error('Error rejecting deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject deal',
    });
  }
});

/**
 * DELETE /api/deals/:id
 * Delete a deal
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('scraped_deals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Deal deleted',
    });
  } catch (error) {
    logger.error('Error deleting deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete deal',
    });
  }
});

/**
 * POST /api/deals/bulk-approve
 * Bulk approve multiple deals
 */
router.post('/bulk-approve', async (req: Request, res: Response) => {
  try {
    const { dealIds, userId } = req.body;

    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'dealIds must be a non-empty array',
      });
    }

    const { error } = await supabase
      .from('scraped_deals')
      .update({
        is_approved: true,
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', dealIds);

    if (error) throw error;

    res.json({
      success: true,
      message: `${dealIds.length} deals approved`,
    });
  } catch (error) {
    logger.error('Error bulk approving deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk approve deals',
    });
  }
});

export default router;

