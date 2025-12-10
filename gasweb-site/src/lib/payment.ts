/**
 * Payment Processing Service
 * 
 * Handles payment integration with Stripe, PayPal, and Crypto
 * for course purchases and subscriptions.
 * 
 * @module lib/payment
 */

import { supabase } from './supabase';

/**
 * Stripe configuration
 */
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/**
 * PayPal configuration
 */
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

/**
 * Payment method types
 */
export type PaymentMethod = 'stripe' | 'paypal' | 'crypto';

/**
 * Payment result interface
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * Purchase request interface
 */
export interface PurchaseRequest {
  courseId: string;
  amount: number;
  currency: string;
  userEmail: string;
  userId?: string;
  paymentMethod: PaymentMethod;
  isSubscription?: boolean;
  couponCode?: string;
}

/**
 * Create a Stripe checkout session
 * 
 * @param request - Purchase request details
 * @returns Payment result with redirect URL
 * 
 * @example
 * const result = await createStripeCheckout({
 *   courseId: 'course-123',
 *   amount: 49.00,
 *   currency: 'USD',
 *   userEmail: 'user@example.com',
 *   paymentMethod: 'stripe'
 * });
 * if (result.redirectUrl) {
 *   window.location.href = result.redirectUrl;
 * }
 */
export async function createStripeCheckout(request: PurchaseRequest): Promise<PaymentResult> {
  try {
    // In production, this would call a Supabase Edge Function
    // that creates a Stripe Checkout Session
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: request.courseId,
        amount: request.amount,
        currency: request.currency,
        email: request.userEmail,
        userId: request.userId,
        isSubscription: request.isSubscription,
        couponCode: request.couponCode,
        successUrl: `${window.location.origin}/education/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/education?cancelled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    
    return {
      success: true,
      redirectUrl: data.url,
      transactionId: data.sessionId,
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Create a PayPal order
 * 
 * @param request - Purchase request details
 * @returns Payment result with order ID
 * 
 * @example
 * const result = await createPayPalOrder({
 *   courseId: 'course-123',
 *   amount: 49.00,
 *   currency: 'USD',
 *   userEmail: 'user@example.com',
 *   paymentMethod: 'paypal'
 * });
 */
export async function createPayPalOrder(request: PurchaseRequest): Promise<PaymentResult> {
  try {
    // In production, this would call a Supabase Edge Function
    // that creates a PayPal order
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: request.courseId,
        amount: request.amount,
        currency: request.currency,
        email: request.userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const data = await response.json();
    
    return {
      success: true,
      transactionId: data.orderId,
      redirectUrl: data.approvalUrl,
    };
  } catch (error) {
    console.error('PayPal order error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Capture PayPal payment after approval
 * 
 * @param orderId - PayPal order ID
 * @returns Payment result
 */
export async function capturePayPalPayment(orderId: string): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/paypal/capture-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to capture payment');
    }

    const data = await response.json();
    
    return {
      success: true,
      transactionId: data.transactionId,
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment capture failed',
    };
  }
}

/**
 * Create a crypto payment request
 * 
 * @param request - Purchase request details
 * @returns Payment result with crypto payment address/URL
 * 
 * @example
 * const result = await createCryptoPayment({
 *   courseId: 'course-123',
 *   amount: 49.00,
 *   currency: 'USD',
 *   userEmail: 'user@example.com',
 *   paymentMethod: 'crypto'
 * });
 */
export async function createCryptoPayment(request: PurchaseRequest): Promise<PaymentResult> {
  try {
    // In production, this would integrate with a crypto payment gateway
    // like Coinbase Commerce, BitPay, or similar
    const response = await fetch('/api/crypto/create-charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: request.courseId,
        amount: request.amount,
        currency: request.currency,
        email: request.userEmail,
        name: 'Course Purchase',
        description: `Purchase of course ${request.courseId}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create crypto payment');
    }

    const data = await response.json();
    
    return {
      success: true,
      transactionId: data.chargeId,
      redirectUrl: data.hostedUrl,
    };
  } catch (error) {
    console.error('Crypto payment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Process payment based on selected method
 * 
 * @param request - Purchase request with payment method
 * @returns Payment result
 * 
 * @example
 * const result = await processPayment({
 *   courseId: 'course-123',
 *   amount: 49.00,
 *   currency: 'USD',
 *   userEmail: 'user@example.com',
 *   paymentMethod: 'stripe'
 * });
 */
export async function processPayment(request: PurchaseRequest): Promise<PaymentResult> {
  switch (request.paymentMethod) {
    case 'stripe':
      return createStripeCheckout(request);
    case 'paypal':
      return createPayPalOrder(request);
    case 'crypto':
      return createCryptoPayment(request);
    default:
      return {
        success: false,
        error: 'Invalid payment method',
      };
  }
}

/**
 * Record purchase in database
 * 
 * @param purchase - Purchase details to record
 * @returns Database record ID
 */
export async function recordPurchase(purchase: {
  courseId: string;
  userEmail: string;
  userId?: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  currency: string;
  transactionId: string;
  isSubscription?: boolean;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('course_purchases')
      .insert({
        course_id: purchase.courseId,
        user_email: purchase.userEmail,
        user_id: purchase.userId || null,
        payment_method: purchase.paymentMethod,
        amount_paid: purchase.amountPaid,
        currency: purchase.currency,
        transaction_id: purchase.transactionId,
        payment_status: 'completed',
        is_subscription: purchase.isSubscription || false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording purchase:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error recording purchase:', error);
    return null;
  }
}

/**
 * Create enrollment after successful purchase
 * 
 * @param courseId - Course ID
 * @param userEmail - User email
 * @param userId - Optional user ID
 * @param enrollmentType - Type of enrollment
 * @returns Enrollment record ID
 */
export async function createEnrollment(
  courseId: string,
  userEmail: string,
  userId?: string,
  enrollmentType: 'free' | 'purchased' | 'subscription' = 'purchased'
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseId,
        user_email: userEmail,
        user_id: userId || null,
        enrollment_type: enrollmentType,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating enrollment:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return null;
  }
}

/**
 * Verify subscription status
 * 
 * @param subscriptionId - External subscription ID
 * @returns Subscription status
 */
export async function verifySubscription(subscriptionId: string): Promise<{
  active: boolean;
  expiresAt?: Date;
}> {
  try {
    // In production, this would verify with the payment provider
    const { data, error } = await supabase
      .from('course_purchases')
      .select('subscription_status, subscription_expires_at')
      .eq('subscription_id', subscriptionId)
      .single();

    if (error || !data) {
      return { active: false };
    }

    return {
      active: data.subscription_status === 'active',
      expiresAt: data.subscription_expires_at 
        ? new Date(data.subscription_expires_at) 
        : undefined,
    };
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return { active: false };
  }
}

/**
 * Cancel subscription
 * 
 * @param subscriptionId - External subscription ID
 * @returns Success status
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    // In production, this would call the payment provider to cancel
    // and then update the database
    const response = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    // Update local database
    await supabase
      .from('course_purchases')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscriptionId);

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Apply coupon code and calculate discount
 * 
 * @param couponCode - Coupon code
 * @param originalAmount - Original price
 * @returns Discounted amount and validity
 */
export async function applyCoupon(
  couponCode: string,
  originalAmount: number
): Promise<{
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}> {
  try {
    // In production, this would verify the coupon in the database
    // For now, return a placeholder response
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: couponCode }),
    });

    if (!response.ok) {
      return {
        valid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        message: 'Invalid coupon code',
      };
    }

    const data = await response.json();
    const discountAmount = data.discountType === 'percentage'
      ? originalAmount * (data.discountValue / 100)
      : data.discountValue;

    return {
      valid: true,
      discountAmount,
      finalAmount: Math.max(0, originalAmount - discountAmount),
      message: data.message,
    };
  } catch (error) {
    return {
      valid: false,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: 'Error validating coupon',
    };
  }
}

export default {
  processPayment,
  createStripeCheckout,
  createPayPalOrder,
  capturePayPalPayment,
  createCryptoPayment,
  recordPurchase,
  createEnrollment,
  verifySubscription,
  cancelSubscription,
  applyCoupon,
};

