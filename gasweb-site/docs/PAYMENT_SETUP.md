# Gasweb.info Payment Setup Guide

This guide covers setting up and configuring payment processing for Gasweb.info, including Stripe, PayPal, and cryptocurrency payments.

## Payment Overview

Gasweb.info supports three payment methods:

| Provider | Use Cases | Features |
|----------|-----------|----------|
| **Stripe** | Cards, subscriptions | Primary payment processor |
| **PayPal** | Alternative payments | Popular for international users |
| **Crypto** | Bitcoin, Ethereum | Decentralized payments |

## Stripe Setup

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete business verification
3. Enable the following features in Dashboard:
   - Checkout
   - Payment Links
   - Customer Portal (for subscriptions)

### 2. Get API Keys

1. Navigate to Developers → API Keys
2. Copy keys:
   - **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → Keep secure, used server-side only

### 3. Configure Products

#### Create a Course Product

1. Go to Products → Add Product
2. Fill in details:
   - Name: "AI Automation Fundamentals"
   - Description: Course description
   - Image: Course thumbnail

3. Add Pricing:
   ```
   One-time purchase:
   - Price: $99.00 USD
   - Billing: One time
   
   Subscription:
   - Price: $19.99 USD
   - Billing: Monthly recurring
   ```

4. Note the Price IDs (e.g., `price_1ABC123...`)

### 4. Frontend Integration

```typescript
// lib/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
```

```typescript
// hooks/useCheckout.ts
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const useCheckout = () => {
  const createCheckoutSession = async (courseId: string, priceId: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in');

    // Create checkout session via Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        courseId,
        priceId,
        userId: user.id,
        successUrl: `${window.location.origin}/education/${courseId}?success=true`,
        cancelUrl: `${window.location.origin}/education/${courseId}?canceled=true`,
      },
    });

    if (error) throw error;

    // Redirect to Stripe Checkout
    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
  };

  return { createCheckoutSession };
};
```

### 5. Webhook Configuration

#### Set Up Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

#### Webhook Handler (Supabase Edge Function)

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-08-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Record purchase
      await supabase.from('course_purchases').insert({
        user_id: session.metadata?.userId,
        course_id: session.metadata?.courseId,
        amount: session.amount_total! / 100,
        currency: session.currency!.toUpperCase(),
        payment_method: 'stripe',
        transaction_id: session.id,
        status: 'completed',
      });

      // Create enrollment
      await supabase.from('course_enrollments').insert({
        user_id: session.metadata?.userId,
        course_id: session.metadata?.courseId,
      });
      
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Handle subscription cancellation
      await supabase
        .from('course_enrollments')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id);
      
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 6. Customer Portal (Subscriptions)

```typescript
// Allow customers to manage subscriptions
const createPortalSession = async () => {
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: { returnUrl: window.location.href },
  });
  
  if (error) throw error;
  window.location.href = data.url;
};
```

## PayPal Setup

### 1. Create PayPal Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create or log in to your account
3. Go to Apps & Credentials

### 2. Create Application

1. Click "Create App"
2. Name: "Gasweb Courses"
3. Select account type:
   - **Sandbox** for testing
   - **Live** for production

4. Copy credentials:
   - **Client ID** → `VITE_PAYPAL_CLIENT_ID`
   - **Secret** → Keep secure, server-side only

### 3. Frontend Integration

```typescript
// lib/paypal.ts
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export const PayPalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PayPalScriptProvider options={{
    'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
  }}>
    {children}
  </PayPalScriptProvider>
);
```

```tsx
// components/PayPalCheckout.tsx
import { PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalCheckoutProps {
  courseId: string;
  amount: number;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  courseId,
  amount,
  onSuccess,
  onError,
}) => {
  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Course: ${courseId}`,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
          }],
        });
      }}
      onApprove={async (data, actions) => {
        const order = await actions.order?.capture();
        if (order) {
          // Record purchase in database
          await recordPurchase(courseId, order.id, 'paypal', amount);
          onSuccess(order.id);
        }
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        onError(new Error('Payment failed'));
      }}
    />
  );
};
```

### 4. PayPal Webhooks

1. Go to Dashboard → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/paypal-webhook`
3. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

## Cryptocurrency Setup

### 1. Set Up Wallet

Create a dedicated wallet for receiving payments:

1. **Bitcoin**: Use a hardware wallet or service like BitPay
2. **Ethereum**: Create wallet via MetaMask or hardware wallet
3. **USDC/Stablecoins**: Same wallet as Ethereum

### 2. Integration Options

#### Option A: Direct Wallet Address

Simple but requires manual verification:

```typescript
// components/CryptoPayment.tsx
interface CryptoPaymentProps {
  courseId: string;
  amount: number;
  onPaymentSubmitted: () => void;
}

export const CryptoPayment: React.FC<CryptoPaymentProps> = ({
  courseId,
  amount,
  onPaymentSubmitted,
}) => {
  const walletAddress = import.meta.env.VITE_CRYPTO_WALLET_ADDRESS;
  const [txHash, setTxHash] = useState('');
  
  const handleSubmit = async () => {
    // Create pending payment record
    await supabase.from('course_purchases').insert({
      course_id: courseId,
      user_id: userId,
      amount,
      currency: 'USDC',
      payment_method: 'crypto',
      transaction_id: txHash,
      status: 'pending_verification',
    });
    
    onPaymentSubmitted();
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="font-medium">Send exactly:</p>
        <p className="text-2xl font-bold">{amount} USDC</p>
        <p className="mt-2 text-sm">To address:</p>
        <code className="block mt-1 p-2 bg-white rounded break-all">
          {walletAddress}
        </code>
      </div>
      
      <div>
        <label className="block text-sm font-medium">Transaction Hash</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="0x..."
          className="mt-1 w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!txHash}
        className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        I've Sent the Payment
      </button>
    </div>
  );
};
```

#### Option B: Coinbase Commerce

More automated approach:

1. Sign up at [commerce.coinbase.com](https://commerce.coinbase.com)
2. Create API key
3. Integrate:

```typescript
// lib/coinbase.ts
import { Client, resources } from 'coinbase-commerce-node';

Client.init(process.env.COINBASE_COMMERCE_API_KEY!);

export const createCryptoCharge = async (
  courseId: string,
  amount: number,
  userId: string
) => {
  const charge = await resources.Charge.create({
    name: `Course Purchase`,
    description: `Course ID: ${courseId}`,
    local_price: {
      amount: amount.toString(),
      currency: 'USD',
    },
    pricing_type: 'fixed_price',
    metadata: {
      courseId,
      userId,
    },
  });

  return {
    chargeId: charge.id,
    hostedUrl: charge.hosted_url,
    addresses: charge.addresses,
  };
};
```

## Payment Flow Implementation

### Unified Payment Modal

```tsx
// components/PaymentModal.tsx
import { useState } from 'react';
import { StripeCheckout } from './StripeCheckout';
import { PayPalCheckout } from './PayPalCheckout';
import { CryptoPayment } from './CryptoPayment';

type PaymentMethod = 'stripe' | 'paypal' | 'crypto';

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  course,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Purchase</h2>
        
        <div className="mb-6">
          <p className="text-gray-600">{course.title}</p>
          <p className="text-3xl font-bold">${course.price}</p>
        </div>

        {/* Payment Method Selector */}
        <div className="flex gap-2 mb-6">
          {(['stripe', 'paypal', 'crypto'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`flex-1 py-2 px-4 rounded border ${
                selectedMethod === method
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              {method === 'stripe' && '💳 Card'}
              {method === 'paypal' && '🅿️ PayPal'}
              {method === 'crypto' && '₿ Crypto'}
            </button>
          ))}
        </div>

        {/* Payment Forms */}
        {selectedMethod === 'stripe' && (
          <StripeCheckout
            courseId={course.id}
            priceId={course.stripe_price_id}
            onSuccess={onSuccess}
          />
        )}
        
        {selectedMethod === 'paypal' && (
          <PayPalCheckout
            courseId={course.id}
            amount={course.price}
            onSuccess={onSuccess}
            onError={(err) => console.error(err)}
          />
        )}
        
        {selectedMethod === 'crypto' && (
          <CryptoPayment
            courseId={course.id}
            amount={course.price}
            onPaymentSubmitted={onSuccess}
          />
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

## Testing

### Test Mode Credentials

#### Stripe Test Cards

| Scenario | Card Number |
|----------|-------------|
| Successful payment | 4242 4242 4242 4242 |
| Declined payment | 4000 0000 0000 0002 |
| Requires authentication | 4000 0025 0000 3155 |

Use any future expiry date and any 3-digit CVC.

#### PayPal Sandbox

1. Create sandbox accounts at developer.paypal.com
2. Use sandbox credentials in development
3. Log in with sandbox buyer account to test

#### Crypto Testing

1. Use testnet networks:
   - Bitcoin: Testnet
   - Ethereum: Goerli or Sepolia testnet
2. Use faucets to get test tokens

### Testing Webhooks Locally

#### Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

#### PayPal Webhook Simulator

1. Go to PayPal Developer Dashboard
2. Webhooks → Webhook Simulator
3. Select event type and send test webhook

## Security Best Practices

### 1. Never Expose Secret Keys

```typescript
// ❌ Wrong - exposing secret key
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY); // DON'T DO THIS

// ✅ Correct - use publishable key on frontend
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### 2. Verify Webhook Signatures

```typescript
// Always verify webhook signatures
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

### 3. Validate Payment Amounts Server-Side

```typescript
// Don't trust client-sent amounts
const course = await getCourse(courseId);
if (session.amount_total !== course.price * 100) {
  throw new Error('Payment amount mismatch');
}
```

### 4. Use HTTPS Only

Ensure all payment pages are served over HTTPS.

### 5. PCI Compliance

- Never store raw card numbers
- Use Stripe Elements or PayPal SDK
- Keep payment processing on provider-hosted pages

## Troubleshooting

### Common Issues

**"Payment failed" with no details**
- Check browser console for errors
- Verify API keys are correct
- Ensure webhooks are configured

**Webhook not receiving events**
- Verify webhook URL is accessible
- Check webhook signing secret
- Review webhook logs in provider dashboard

**Subscription not updating**
- Ensure subscription events are selected
- Check database update logic
- Verify user ID mapping

### Debug Logging

```typescript
// Add logging for debugging
console.log('Creating checkout session:', {
  courseId,
  priceId,
  userId,
});

try {
  const session = await stripe.checkout.sessions.create({...});
  console.log('Session created:', session.id);
} catch (error) {
  console.error('Checkout error:', error);
}
```

---

## Quick Reference

### Environment Variables

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...

# Crypto
VITE_CRYPTO_WALLET_ADDRESS=0x...
```

### Webhook URLs

- Stripe: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- PayPal: `https://your-project.supabase.co/functions/v1/paypal-webhook`

### Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Coinbase Commerce Docs](https://commerce.coinbase.com/docs/)

