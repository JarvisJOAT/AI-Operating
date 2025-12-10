# Food Truck Setup Guide

Complete setup instructions for the Food Truck mobile ordering and AI voice agent application.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Twilio Account** (for voice and SMS)
- **OpenAI API Key** (for voice agent)
- **Supabase Account** (for database)
- **Stripe Account** (for payments)

## Quick Start

### 1. Navigate to Project

```bash
cd AI-Operating/business-apps/food-truck
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

### 4. Apply Database Migrations

```bash
cd ../../
npx supabase db push
```

### 5. Start the Server

```bash
npm run dev
```

Server runs on `http://localhost:3002`

## Environment Configuration

### Complete .env Template

```env
# ===================
# SERVER
# ===================
PORT=3002
NODE_ENV=development

# ===================
# ORGANIZATION
# ===================
ORGANIZATION_ID=your-organization-uuid

# ===================
# SUPABASE
# ===================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===================
# TWILIO (Voice & SMS)
# ===================
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VOICE_WEBHOOK_URL=https://your-domain.com/api/voice/incoming

# ===================
# OPENAI
# ===================
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o
OPENAI_TTS_MODEL=tts-1
OPENAI_WHISPER_MODEL=whisper-1

# ===================
# PAYMENTS
# ===================
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (optional)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_SANDBOX=true

# ===================
# EMAIL (Notifications)
# ===================
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=orders@yourfoodtruck.com

# ===================
# BUSINESS CONFIG
# ===================
BUSINESS_NAME=This What I Do BBQ
BUSINESS_PHONE=+1234567890
BUSINESS_ADDRESS=Houston, TX
DEFAULT_PREP_TIME=15
TAX_RATE=0.0825
```

## Twilio Setup

### 1. Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for an account
3. Complete verification

### 2. Get Phone Number

1. Go to Console → Phone Numbers → Buy a Number
2. Select a number with Voice and SMS capabilities
3. Purchase the number

### 3. Get Credentials

1. Go to Console → Account Info
2. Copy:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`

### 4. Configure Voice Webhook

1. Go to Phone Numbers → Manage → Active Numbers
2. Click on your number
3. Under "Voice & Fax":
   - "A CALL COMES IN": Webhook
   - URL: `https://your-domain.com/api/voice/incoming`
   - Method: POST

### 5. Configure SMS Webhook (Optional)

For SMS order confirmations:
- "A MESSAGE COMES IN": Webhook
- URL: `https://your-domain.com/api/sms/incoming`
- Method: POST

### 6. Test Locally with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3002

# Use the ngrok URL for webhook testing
# https://abc123.ngrok.io/api/voice/incoming
```

## OpenAI Setup

### 1. Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create new secret key
4. Copy to `OPENAI_API_KEY`

### 2. Voice Agent Models

The voice agent uses three OpenAI services:

| Service | Model | Purpose |
|---------|-------|---------|
| Whisper | `whisper-1` | Speech-to-text transcription |
| GPT-4o | `gpt-4o` | Intent understanding & responses |
| TTS | `tts-1` | Text-to-speech for responses |

### 3. Configure Voice Personality

Edit `src/services/voiceAgent.ts` to customize:

```typescript
const SYSTEM_PROMPT = `You are a friendly order-taking assistant for ${BUSINESS_NAME}.
- Be warm and welcoming
- Confirm orders clearly
- Suggest popular items
- Handle special requests gracefully
- Keep responses concise for phone calls`;
```

## Payment Setup

### Stripe Configuration

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Complete business verification

2. **Get API Keys**
   - Dashboard → Developers → API Keys
   - Copy Secret Key → `STRIPE_SECRET_KEY`
   - Copy Publishable Key → `STRIPE_PUBLISHABLE_KEY`

3. **Configure Webhooks**
   - Developers → Webhooks → Add Endpoint
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

### PayPal Configuration (Optional)

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create app
3. Copy Client ID and Secret

## Menu Import

### From thiswhatidobbq.com

The menu structure is pre-configured based on This What I Do BBQ. To customize:

### 1. Add Categories

```sql
INSERT INTO menu_categories (organization_id, name, description, order_index)
VALUES 
  ('org-uuid', 'Plates', 'BBQ plates with sides', 1),
  ('org-uuid', 'Sandwiches', 'BBQ sandwiches', 2),
  ('org-uuid', 'Sides', 'Side dishes', 3),
  ('org-uuid', 'Drinks', 'Beverages', 4);
```

### 2. Add Menu Items

```sql
INSERT INTO menu_items (
  organization_id, 
  category_id, 
  name, 
  description, 
  price, 
  is_available
) VALUES 
  ('org-uuid', 'plates-uuid', 'Brisket Plate', 'Sliced brisket with 2 sides', 18.99, true),
  ('org-uuid', 'plates-uuid', 'Ribs Plate', 'Pork ribs with 2 sides', 21.99, true),
  ('org-uuid', 'sandwiches-uuid', 'Chopped Beef Sandwich', 'Chopped brisket on Texas toast', 12.99, true);
```

### 3. Via API

```bash
# Add category
curl -X POST http://localhost:3002/api/menu/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plates",
    "description": "BBQ plates with sides",
    "order_index": 1
  }'

# Add item
curl -X POST http://localhost:3002/api/menu/items \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "category-uuid",
    "name": "Brisket Plate",
    "description": "Sliced brisket with 2 sides",
    "price": 18.99
  }'
```

## Notification Setup

### SMS Notifications

Already configured through Twilio. Test with:

```bash
curl -X POST http://localhost:3002/api/notifications/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

### Email Notifications

1. Configure SMTP settings in `.env`
2. Test with:

```bash
curl -X POST http://localhost:3002/api/notifications/test/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Database Schema

Verify these tables exist:

- `menu_categories`
- `menu_items`
- `orders`
- `order_items`
- `customers`
- `order_notifications`
- `voice_conversations`

## Testing

### Test Voice Agent

1. Start the server: `npm run dev`
2. Start ngrok: `ngrok http 3002`
3. Update Twilio webhook with ngrok URL
4. Call your Twilio number

### Test Order Flow

```bash
# Create order
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "items": [
      {"menu_item_id": "item-uuid", "quantity": 2}
    ]
  }'

# Get order status
curl http://localhost:3002/api/orders/{order-id}
```

### Test Payments

```bash
# Create payment intent
curl -X POST http://localhost:3002/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order-uuid"}'
```

## Troubleshooting

### Voice Agent Issues

**"Call disconnects immediately"**
- Check Twilio webhook URL
- Verify ngrok is running (for local testing)
- Review server logs

**"Agent doesn't understand orders"**
- Check OpenAI API key
- Review Whisper transcription quality
- Adjust system prompt

### Payment Issues

**"Payment fails"**
- Verify Stripe keys are correct
- Use test cards in development
- Check webhook configuration

### Notification Issues

**"SMS not sending"**
- Verify Twilio credentials
- Check phone number format (+1...)
- Review Twilio logs

---

## Next Steps

1. [Voice Agent Guide](./VOICE_AGENT_GUIDE.md)
2. [API Reference](./API_REFERENCE.md)
3. [User Manual](./USER_MANUAL.md)

