/**
 * Payments Routes
 * 
 * API endpoints for payment processing.
 * 
 * @module routes/payments
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * POST /api/payments/create-intent
 * Create a payment intent for an order
 */
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, currency = 'usd', customerEmail } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'orderId and amount are required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
      },
      receipt_email: customerEmail,
    });

    // Update order with payment ID
    await supabase
      .from('orders')
      .update({
        payment_id: paymentIntent.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/payments/confirm
 * Confirm a payment (called after client-side payment completion)
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', paymentIntentId);

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({
        success: false,
        error: `Payment not successful. Status: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm payment' });
  }
});

/**
 * POST /api/payments/refund
 * Process a refund
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, reason } = req.body;

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('payment_id, total')
      .eq('id', orderId)
      .single();

    if (orderError || !order?.payment_id) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or no payment associated',
      });
    }

    const refundAmount = amount || order.total;

    const refund = await stripe.refunds.create({
      payment_intent: order.payment_id,
      amount: Math.round(refundAmount * 100),
      reason: 'requested_by_customer',
      metadata: {
        orderId,
        refundReason: reason || 'Customer requested',
      },
    });

    // Update order status
    await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refundAmount,
      },
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ success: false, error: 'Failed to process refund' });
  }
});

/**
 * POST /api/payments/cash
 * Record a cash payment
 */
router.post('/cash', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_method: 'cash',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Cash payment recorded' });
  } catch (error) {
    logger.error('Error recording cash payment:', error);
    res.status(500).json({ success: false, error: 'Failed to record cash payment' });
  }
});

/**
 * GET /api/payments/:orderId
 * Get payment status for an order
 */
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, payment_id, payment_method, payment_status, total')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let stripeDetails = null;
    if (order.payment_id && order.payment_method === 'card') {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_id);
        stripeDetails = {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          created: new Date(paymentIntent.created * 1000).toISOString(),
        };
      } catch {
        // Ignore Stripe errors
      }
    }

    res.json({
      success: true,
      data: {
        ...order,
        stripeDetails,
      },
    });
  } catch (error) {
    logger.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment status' });
  }
});

export default router;

