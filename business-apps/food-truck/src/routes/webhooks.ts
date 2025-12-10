/**
 * Webhooks Routes
 * 
 * Handle external webhooks (Stripe, Twilio, etc.)
 * 
 * @module routes/webhooks
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
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 */
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          logger.info('Payment succeeded for order:', orderId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          logger.warn('Payment failed for order:', orderId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_id', paymentIntentId);

        logger.info('Refund processed for payment:', paymentIntentId);
        break;
      }

      default:
        logger.info('Unhandled Stripe event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/webhooks/twilio/sms
 * Handle incoming SMS via Twilio
 */
router.post('/twilio/sms', async (req: Request, res: Response) => {
  try {
    const { From, Body, MessageSid } = req.body;

    logger.info('Incoming SMS:', { from: From, body: Body, sid: MessageSid });

    // Find customer by phone
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name')
      .eq('phone', From)
      .single();

    // Check if this is an order status inquiry
    const orderMatch = Body.match(/order\s*#?\s*(\w+-\d+-\d+)/i);
    
    if (orderMatch) {
      const orderNumber = orderMatch[1];
      
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, status, estimated_ready_at')
        .eq('order_number', orderNumber)
        .single();

      if (order) {
        const statusMessages: Record<string, string> = {
          pending: 'Your order is pending confirmation.',
          confirmed: 'Your order has been confirmed and will be prepared soon.',
          preparing: 'Your order is being prepared right now!',
          ready: 'Your order is READY for pickup!',
          completed: 'Your order has been completed. Thanks for your business!',
          cancelled: 'Your order was cancelled.',
        };

        const response = statusMessages[order.status] || 'Unknown status.';
        
        // Use Twilio TwiML to respond
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Message>${response}</Message>
          </Response>`;

        res.type('text/xml');
        return res.send(twiml);
      }
    }

    // Default response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Thanks for texting This What I Do BBQ! To check order status, text "order #" followed by your order number. To place an order, call us or visit our website.</Message>
      </Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    logger.error('Error handling SMS webhook:', error);
    res.status(500).send('Error');
  }
});

/**
 * POST /api/webhooks/twilio/status
 * Handle SMS delivery status updates
 */
router.post('/twilio/status', async (req: Request, res: Response) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode } = req.body;

    logger.info('SMS status update:', { sid: MessageSid, status: MessageStatus, error: ErrorCode });

    // Map Twilio status to our status
    const statusMap: Record<string, string> = {
      queued: 'pending',
      sent: 'sent',
      delivered: 'delivered',
      undelivered: 'failed',
      failed: 'failed',
    };

    const status = statusMap[MessageStatus] || 'pending';

    // Update notification status in database
    // Note: We'd need to store MessageSid when sending to properly track this
    // For now, just log it

    res.sendStatus(200);
  } catch (error) {
    logger.error('Error handling SMS status webhook:', error);
    res.sendStatus(500);
  }
});

export default router;

