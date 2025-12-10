# 🚀 AI-Operating Platform

> **Comprehensive AI-powered business automation platform** for managing multiple business applications, AI agents, CRM, projects, and unified messaging.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Business Applications](#business-applications)
- [Core Features](#core-features)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AI-Operating is an enterprise-grade platform designed to:

- **Manage AI Agents**: Voice agents, chat agents, and task automation
- **Integrate Business Apps**: Unified dashboard for multiple business applications
- **CRM & Project Management**: Full-featured customer and project tracking
- **Multi-tenant Architecture**: Secure data isolation between organizations
- **Real-time Sync**: Periodic synchronization between apps and central dashboard

### Business Applications

| App | Description | Key Features |
|-----|-------------|--------------|
| **Keys Open Doors** | Real estate deal automation | InvestorLift scraping, AI captions, Instagram auto-posting |
| **Food Truck** | Mobile ordering system | AI voice agent, order management, SMS notifications |
| **Construction Manager** | Project management | OCR receipts, multilingual messaging, document versioning |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-Operating Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   gasweb-site   │  │  AI-Operating   │  │  Admin Panel    │ │
│  │   (Marketing)   │  │   Dashboard     │  │   (Internal)    │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           └──────────────────────────────────────────┘          │
│                              │                                  │
│                    ┌─────────▼─────────┐                       │
│                    │   Supabase        │                       │
│                    │ (PostgreSQL + RLS)│                       │
│                    └─────────┬─────────┘                       │
│                              │                                  │
│  ┌───────────────────────────┼───────────────────────────┐     │
│  │                    Business Apps                       │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │     │
│  │  │ Keys Open    │  │  Food Truck  │  │ Construction │ │     │
│  │  │    Doors     │  │   Ordering   │  │   Manager    │ │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL), Edge Functions |
| **Auth** | Supabase Auth (OAuth, Magic Link) |
| **Real-time** | Supabase Realtime |
| **APIs** | OpenAI GPT-4o, Twilio, Google Cloud Vision/Translate |
| **Payments** | Stripe, PayPal, Crypto |

---

## 📁 Project Structure

```
AI-Operating/
├── project/                    # Main AI-Operating Dashboard
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── services/           # Business logic services
│   │   └── lib/                # Utilities and Supabase client
│   └── package.json
│
├── gasweb-site/                # Marketing website (gasweb.info)
│   ├── src/
│   │   ├── pages/              # Home, Services, Education, etc.
│   │   └── components/         # Layout, Navigation
│   └── package.json
│
├── business-apps/              # Individual business applications
│   ├── keys-open-doors/        # Real estate automation
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── services/       # Scraper, Poster, Caption Gen
│   │   │   └── config/         # App configuration
│   │   └── package.json
│   │
│   ├── food-truck/             # Food ordering system
│   │   ├── src/
│   │   │   ├── routes/         # Orders, Menu, Voice
│   │   │   ├── services/       # Voice Agent, Payments
│   │   │   └── config/
│   │   └── package.json
│   │
│   └── construction-mgmt/      # Construction management
│       ├── src/
│       │   ├── routes/         # Projects, Tasks, Expenses
│       │   ├── services/       # OCR, Translation
│       │   └── config/
│       └── package.json
│
├── supabase/
│   ├── config.toml             # Supabase configuration
│   └── migrations/             # Database schema migrations
│
├── docs/                       # Documentation
│   ├── integration/
│   └── admin-training/
│
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API keys: OpenAI, Twilio, Google Cloud

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/ai-operating.git
cd ai-operating

# Install dependencies for main dashboard
cd project
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Twilio (for Food Truck Voice Agent)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Google Cloud (for OCR & Translation)
GOOGLE_CLOUD_KEY_FILE=path_to_key.json
GOOGLE_TRANSLATE_API_KEY=your_translate_key

# Stripe (for Payments)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## 📱 Business Applications

### Keys Open Doors

**Real estate wholesale deal automation**

- **Scraping**: Automated InvestorLift marketplace scraping with Selenium
- **AI Captions**: GPT-4o powered Instagram caption generation
- **Auto-posting**: Instagram Graph API / instagrapi integration
- **Analytics**: Deal performance tracking

```bash
cd business-apps/keys-open-doors
npm install
npm run dev  # Starts on port 3001
```

### Food Truck Ordering

**AI-powered mobile ordering for food trucks**

- **Voice Agent**: Twilio + OpenAI Whisper + GPT-4o
- **Order Management**: Real-time order tracking
- **Payments**: Cash, card, mobile, crypto
- **Notifications**: SMS/Email order updates

```bash
cd business-apps/food-truck
npm install
npm run dev  # Starts on port 3002
```

### Construction Manager

**Project management with multilingual support**

- **Projects**: Full project lifecycle management
- **Tasks**: Kanban board with assignments
- **Receipts**: OCR processing with Google Vision
- **Translation**: Real-time message translation
- **Documents**: Version control system

```bash
cd business-apps/construction-mgmt
npm install
npm run dev  # Starts on port 3003
```

---

## ⚡ Core Features

### AI Agent Management
- Voice agents for customer calls
- Chat agents for support
- Task automation agents

### CRM System
- Contact & company management
- Deal pipeline tracking
- Activity logging

### Project Management
- Multi-workspace support
- Task boards (Kanban)
- Time tracking

### Unified Messaging
- Cross-platform messaging
- Real-time notifications
- Message threading

### Business Apps Hub
- App instance management
- Centralized configuration
- Usage analytics

### Admin Dashboard
- Cross-organization view
- System health monitoring
- Event audit logs

---

## 🗃️ Database Schema

Key tables (see `supabase/migrations/` for full schema):

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant organization management |
| `user_profiles` | User settings and preferences |
| `business_apps` | App catalog |
| `app_instances` | Per-org app deployments |
| `app_configurations` | Instance-specific settings |
| `app_sync_logs` | Data sync history |

### Row Level Security (RLS)

All tables implement RLS policies ensuring:
- Users can only access their organization's data
- Public read access where appropriate
- Admin-only write access for sensitive operations

---

## 📖 API Documentation

### Main Dashboard API

Base URL: `https://api.ai-operating.com/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/organizations` | GET | List user's organizations |
| `/app-instances` | GET | Get app instances |
| `/app-instances/:id/sync` | POST | Trigger sync |
| `/agents` | GET/POST | Manage AI agents |

### Business App APIs

Each business app exposes its own API:

- Keys Open Doors: `http://localhost:3001/api`
- Food Truck: `http://localhost:3002/api`
- Construction: `http://localhost:3003/api`

See individual app documentation in `business-apps/*/docs/`.

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
# Deploy main dashboard
cd project
vercel deploy --prod

# Deploy gasweb-site
cd ../gasweb-site
vercel deploy --prod
```

### Railway/Render (Business Apps)

Each business app can be deployed as a separate service:

```bash
# Example: Deploy Keys Open Doors
cd business-apps/keys-open-doors
railway up  # or render deploy
```

### Database Migrations

```bash
# Run Supabase migrations
npx supabase db push
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- JSDoc comments for public APIs

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

- **Documentation**: `/docs`
- **Email**: support@gasweb.info
- **Issues**: GitHub Issues

---

Built with ❤️ by the GAS Team
