# 🚚 Food Truck Ordering - AI Voice Agent System

> **Mobile ordering platform with AI voice agent** for food trucks and restaurants.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Twilio](https://img.shields.io/badge/Twilio-Voice-red)](https://www.twilio.com/)

---

## 🎯 Overview

A complete ordering solution featuring:

- **AI Voice Agent**: Handle phone orders with natural conversation
- **Order Management**: Real-time order tracking and status updates
- **Payment Processing**: Multiple payment methods supported
- **Notifications**: SMS and email order confirmations

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev  # Runs on port 3002
```

---

## 📁 Project Structure

```
food-truck/
├── src/
│   ├── routes/
│   │   ├── menu.ts          # Menu management
│   │   ├── orders.ts        # Order CRUD
│   │   ├── customers.ts     # Customer management
│   │   ├── voice.ts         # Twilio voice webhooks
│   │   ├── payments.ts      # Payment processing
│   │   └── notifications.ts # SMS/Email notifications
│   ├── services/
│   │   ├── voice-agent.ts   # AI voice processing
│   │   ├── payment.ts       # Payment integration
│   │   └── notification.ts  # Notification service
│   ├── config/
│   │   └── index.ts
│   └── index.ts
├── docs/
└── package.json
```

---

## 🔧 Configuration

```env
# Server
PORT=3002
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio (Voice & SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (Voice Agent)
OPENAI_API_KEY=your_openai_key

# Stripe (Payments)
STRIPE_SECRET_KEY=your_stripe_key

# Email (Notifications)
SENDGRID_API_KEY=your_sendgrid_key
```

---

## 📡 API Endpoints

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get full menu |
| GET | `/api/menu/categories` | Get categories |
| POST | `/api/menu/items` | Add menu item |
| PATCH | `/api/menu/items/:id` | Update item |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update status |
| GET | `/api/orders/active` | Get active orders |

### Voice

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voice/incoming` | Twilio webhook |
| POST | `/api/voice/status` | Call status updates |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create payment |
| POST | `/api/payments/webhook` | Stripe webhook |

---

## 🗣️ Voice Agent

The AI voice agent uses:

1. **Twilio Voice API**: Handle incoming calls
2. **OpenAI Whisper**: Speech-to-text transcription
3. **GPT-4o**: Natural language understanding
4. **ElevenLabs/OpenAI TTS**: Text-to-speech responses

### Voice Flow

```
Customer Call → Twilio → Whisper → GPT-4o → TTS → Customer
                                     ↓
                               Order Created
```

---

## 💳 Supported Payments

- Cash (on pickup)
- Credit/Debit Card (Stripe)
- Apple Pay / Google Pay
- Cryptocurrency (optional)

---

## 📖 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Voice Agent Guide](./docs/VOICE_AGENT_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [User Manual](./docs/USER_MANUAL.md)

---

## 📄 License

Proprietary - All rights reserved.

