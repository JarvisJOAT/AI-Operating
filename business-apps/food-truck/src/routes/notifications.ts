/**
 * Notifications Routes
 * 
 * API endpoints for SMS, email, and push notifications.
 * 
 * @module routes/notifications
 */

import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import Twilio from 'twilio';
import nodemailer from 'nodemailer';

const router = Router();

// Initialize Twilio for SMS
const twilioClient = new Twilio.Twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

// Initialize nodemailer for emails
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Notification templates
 */
const TEMPLATES = {
  ORDER_CONFIRMED: {
    sms: (orderNumber: string, readyTime: string) => 
      `Thanks for your order #${orderNumber}! Your food will be ready around ${readyTime}. We'll text you when it's ready!`,
    email: {
      subject: 'Order Confirmed - This What I Do BBQ',
      body: (orderNumber: string, items: string, total: string, readyTime: string) => `
        <h2>Order Confirmed! 🍖</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order #:</strong> ${orderNumber}</p>
        <p><strong>Items:</strong></p>
        ${items}
        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Estimated Ready Time:</strong> ${readyTime}</p>
        <p>We'll send you another notification when your order is ready for pickup!</p>
      `,
    },
  },
  ORDER_READY: {
    sms: (orderNumber: string) => 
      `🔔 Your order #${orderNumber} is READY! Come pick it up while it's hot! 🍖`,
    email: {
      subject: 'Your Order is Ready! - This What I Do BBQ',
      body: (orderNumber: string) => `
        <h2>Your Order is Ready! 🎉</h2>
        <p>Order #${orderNumber} is ready for pickup!</p>
        <p>Come and get it while it's hot! 🍖</p>
        <p>Thank you for choosing This What I Do BBQ!</p>
      `,
    },
  },
  ORDER_CANCELLED: {
    sms: (orderNumber: string) => 
      `Your order #${orderNumber} has been cancelled. If you have questions, please call us.`,
    email: {
      subject: 'Order Cancelled - This What I Do BBQ',
      body: (orderNumber: string, reason: string) => `
        <h2>Order Cancelled</h2>
        <p>Your order #${orderNumber} has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions, please contact us.</p>
      `,
    },
  },
};

/**
 * Send SMS notification
 */
async function sendSMS(to: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    logger.info('SMS sent:', { sid: result.sid, to });
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error('SMS send failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send email notification
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || '"This What I Do BBQ" <orders@thiswhatidobbq.com>',
      to,
      subject,
      html,
    });

    logger.info('Email sent:', { messageId: result.messageId, to });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Email send failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * POST /api/notifications/send
 * Send a notification
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { orderId, type, recipient, message, subject } = req.body;

    if (!orderId || !type || !recipient || !message) {
      return res.status(400).json({
        success: false,
        error: 'orderId, type, recipient, and message are required',
      });
    }

    // Create notification record
    const { data: notification, error: insertError } = await supabase
      .from('order_notifications')
      .insert({
        order_id: orderId,
        type,
        recipient,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    let result: { success: boolean; sid?: string; messageId?: string; error?: string };

    // Send notification based on type
    if (type === 'sms') {
      result = await sendSMS(recipient, message);
    } else if (type === 'email') {
      result = await sendEmail(recipient, subject || 'Order Update', message);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid notification type' });
    }

    // Update notification status
    await supabase
      .from('order_notifications')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error,
      })
      .eq('id', notification.id);

    res.json({
      success: result.success,
      data: { notificationId: notification.id, ...result },
    });
  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({ success: false, error: 'Failed to send notification' });
  }
});

/**
 * POST /api/notifications/order/:orderId/:event
 * Send order event notifications (confirmed, ready, cancelled)
 */
router.post('/order/:orderId/:event', async (req: Request, res: Response) => {
  try {
    const { orderId, event } = req.params;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const results: any[] = [];

    // Send SMS notification
    if (order.customer_phone) {
      let smsMessage: string;
      
      if (event === 'confirmed') {
        const readyTime = order.estimated_ready_at 
          ? new Date(order.estimated_ready_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : 'soon';
        smsMessage = TEMPLATES.ORDER_CONFIRMED.sms(order.order_number, readyTime);
      } else if (event === 'ready') {
        smsMessage = TEMPLATES.ORDER_READY.sms(order.order_number);
      } else if (event === 'cancelled') {
        smsMessage = TEMPLATES.ORDER_CANCELLED.sms(order.order_number);
      } else {
        return res.status(400).json({ success: false, error: 'Invalid event type' });
      }

      const smsResult = await sendSMS(order.customer_phone, smsMessage);
      results.push({ type: 'sms', ...smsResult });

      // Record notification
      await supabase.from('order_notifications').insert({
        order_id: orderId,
        type: 'sms',
        recipient: order.customer_phone,
        message: smsMessage,
        status: smsResult.success ? 'sent' : 'failed',
        sent_at: smsResult.success ? new Date().toISOString() : null,
        error_message: smsResult.error,
      });
    }

    // Send email notification if email provided
    if (order.customer_email) {
      let emailSubject: string;
      let emailBody: string;

      if (event === 'confirmed') {
        const readyTime = order.estimated_ready_at 
          ? new Date(order.estimated_ready_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : 'soon';
        const itemsHtml = order.items.map((item: any) => 
          `<li>${item.quantity}x ${item.name} - $${item.price.toFixed(2)}</li>`
        ).join('');
        emailSubject = TEMPLATES.ORDER_CONFIRMED.email.subject;
        emailBody = TEMPLATES.ORDER_CONFIRMED.email.body(
          order.order_number,
          `<ul>${itemsHtml}</ul>`,
          `$${order.total.toFixed(2)}`,
          readyTime
        );
      } else if (event === 'ready') {
        emailSubject = TEMPLATES.ORDER_READY.email.subject;
        emailBody = TEMPLATES.ORDER_READY.email.body(order.order_number);
      } else if (event === 'cancelled') {
        emailSubject = TEMPLATES.ORDER_CANCELLED.email.subject;
        emailBody = TEMPLATES.ORDER_CANCELLED.email.body(order.order_number, req.body.reason || '');
      } else {
        return res.status(400).json({ success: false, error: 'Invalid event type' });
      }

      const emailResult = await sendEmail(order.customer_email, emailSubject, emailBody);
      results.push({ type: 'email', ...emailResult });

      // Record notification
      await supabase.from('order_notifications').insert({
        order_id: orderId,
        type: 'email',
        recipient: order.customer_email,
        message: emailBody,
        status: emailResult.success ? 'sent' : 'failed',
        sent_at: emailResult.success ? new Date().toISOString() : null,
        error_message: emailResult.error,
      });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Error sending order notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to send notifications' });
  }
});

/**
 * GET /api/notifications/order/:orderId
 * Get notifications for an order
 */
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

export default router;

