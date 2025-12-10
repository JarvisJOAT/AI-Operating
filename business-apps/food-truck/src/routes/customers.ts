/**
 * Customers Routes
 * 
 * API endpoints for customer management.
 * 
 * @module routes/customers
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/customers
 * List all customers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { organizationId, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: { total: count, limit: Number(limit), offset: Number(offset) },
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

/**
 * GET /api/customers/:id
 * Get a specific customer
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer' });
  }
});

/**
 * GET /api/customers/phone/:phone
 * Find customer by phone number
 */
router.get('/phone/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ success: true, data: data || null });
  } catch (error) {
    logger.error('Error fetching customer by phone:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer' });
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { organizationId, name, email, phone, preferences } = req.body;

    if (!organizationId || !name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'organizationId, name, and phone are required',
      });
    }

    // Check if customer already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Customer with this phone number already exists',
        existingId: existing.id,
      });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        organization_id: organizationId,
        name,
        email,
        phone,
        preferences: preferences || {},
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
});

/**
 * PATCH /api/customers/:id
 * Update a customer
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.organization_id;
    delete updates.created_at;
    delete updates.total_orders;
    delete updates.total_spent;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating customer:', error);
    res.status(500).json({ success: false, error: 'Failed to update customer' });
  }
});

/**
 * GET /api/customers/:id/orders
 * Get customer's order history
 */
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching customer orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer orders' });
  }
});

/**
 * POST /api/customers/:id/loyalty
 * Add loyalty points
 */
router.post('/:id/loyalty', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    // Get current customer
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (customer?.loyalty_points || 0) + points;

    const { data, error } = await supabase
      .from('customers')
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: `${points > 0 ? 'Added' : 'Deducted'} ${Math.abs(points)} points`,
    });
  } catch (error) {
    logger.error('Error updating loyalty points:', error);
    res.status(500).json({ success: false, error: 'Failed to update loyalty points' });
  }
});

export default router;

