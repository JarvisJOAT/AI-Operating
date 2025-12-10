/**
 * Orders Routes
 * 
 * API endpoints for order management.
 * 
 * @module routes/orders
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

/**
 * Calculate estimated ready time based on items
 */
function calculateEstimatedReadyTime(items: any[]): Date {
  const maxPrepTime = Math.max(...items.map(item => item.preparationTime || 10));
  const estimatedMinutes = maxPrepTime + 5; // Add buffer
  const readyTime = new Date();
  readyTime.setMinutes(readyTime.getMinutes() + estimatedMinutes);
  return readyTime;
}

/**
 * GET /api/orders
 * List orders with filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      status,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = req.query;

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: { total: count, limit: Number(limit), offset: Number(offset) },
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/active
 * Get active orders (not completed or cancelled)
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.query;

    let query = supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: true });

    if (organizationId) query = query.eq('organization_id', organizationId);

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching active orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active orders' });
  }
});

/**
 * GET /api/orders/:id
 * Get a specific order
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_notifications (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      customerId,
      items,
      orderType = 'pickup',
      customerName,
      customerPhone,
      customerEmail,
      specialInstructions,
      paymentMethod = 'card',
      tip = 0,
      source = 'web',
    } = req.body;

    if (!organizationId || !items || !items.length || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'organizationId, items, customerName, and customerPhone are required',
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0);
    const taxRate = 0.0825; // 8.25% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax + tip;

    // Generate order number and estimated ready time
    const orderNumber = generateOrderNumber();
    const estimatedReadyAt = calculateEstimatedReadyTime(items);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        organization_id: organizationId,
        customer_id: customerId,
        order_number: orderNumber,
        status: 'pending',
        order_type: orderType,
        items,
        subtotal,
        tax,
        tip,
        discount: 0,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        special_instructions: specialInstructions,
        estimated_ready_at: estimatedReadyAt.toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        source,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Order created successfully',
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Trigger notification for status change

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

/**
 * POST /api/orders/:id/confirm
 * Confirm an order
 */
router.post('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estimatedReadyMinutes } = req.body;

    const updates: any = {
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    };

    if (estimatedReadyMinutes) {
      const readyTime = new Date();
      readyTime.setMinutes(readyTime.getMinutes() + estimatedReadyMinutes);
      updates.estimated_ready_at = readyTime.toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Order confirmed' });
  } catch (error) {
    logger.error('Error confirming order:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm order' });
  }
});

/**
 * POST /api/orders/:id/cancel
 * Cancel an order
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        special_instructions: reason ? `CANCELLED: ${reason}` : 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // TODO: Process refund if paid

    res.json({ success: true, data, message: 'Order cancelled' });
  } catch (error) {
    logger.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
});

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    let query = supabase
      .from('orders')
      .select('status, total, created_at');

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      totalOrders: data?.length || 0,
      completedOrders: data?.filter(o => o.status === 'completed').length || 0,
      cancelledOrders: data?.filter(o => o.status === 'cancelled').length || 0,
      pendingOrders: data?.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length || 0,
      totalRevenue: data?.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0) || 0,
      averageOrderValue: 0,
    };

    if (stats.completedOrders > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.completedOrders;
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error fetching order stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order stats' });
  }
});

export default router;

