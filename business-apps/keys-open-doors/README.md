# 🏠 Keys Open Doors - Real Estate Automation

> **Automated real estate deal scraping and Instagram marketing platform** for wholesale real estate investors.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)

---

## 🎯 Overview

Keys Open Doors automates the process of finding and marketing wholesale real estate deals:

1. **Scraping**: Automatically scrape deals from InvestorLift marketplace
2. **Processing**: Filter and prepare deals for posting
3. **AI Captions**: Generate engaging Instagram captions with GPT-4o
4. **Auto-posting**: Post deals to Instagram automatically
5. **Analytics**: Track engagement and deal performance

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev  # Runs on port 3001
```

---

## 📁 Project Structure

```
keys-open-doors/
├── src/
│   ├── routes/
│   │   ├── scraping.ts      # Scraping job management
│   │   ├── deals.ts         # Deal CRUD operations
│   │   ├── posts.ts         # Instagram post management
│   │   ├── analytics.ts     # Performance metrics
│   │   └── config.ts        # Configuration management
│   ├── services/
│   │   ├── scraper.ts       # InvestorLift scraper
│   │   ├── poster.ts        # Instagram posting
│   │   ├── caption-generator.ts  # AI caption generation
│   │   └── scheduler.ts     # Cron job scheduler
│   ├── config/
│   │   └── index.ts         # App configuration
│   ├── utils/
│   │   ├── supabase.ts      # Database client
│   │   └── logger.ts        # Logging utility
│   ├── types/
│   │   └── database.ts      # TypeScript types
│   └── index.ts             # Entry point
├── docs/
├── .env.example
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# InvestorLift
INVESTORLIFT_EMAIL=your_email
INVESTORLIFT_PASSWORD=your_password

# Instagram (choose one method)
# Graph API Method
INSTAGRAM_GRAPH_ACCESS_TOKEN=your_access_token
INSTAGRAM_GRAPH_PAGE_ID=your_page_id

# Or instagrapi Method
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password

# OpenAI (for captions)
OPENAI_API_KEY=your_openai_key
```

---

## 📡 API Endpoints

### Scraping

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/scraping/start` | Start a new scraping job |
| GET | `/api/scraping/status/:jobId` | Get scraping job status |

### Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deals` | List all scraped deals |
| GET | `/api/deals/:id` | Get single deal |
| PUT | `/api/deals/:id/status` | Update deal status |

### Instagram Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all posts |
| POST | `/api/posts/trigger/:dealId` | Post deal to Instagram |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get post analytics |

---

## 📊 Database Schema

### Tables

- `scraping_jobs`: Track scraping job execution
- `scraped_deals`: Store scraped deal information
- `instagram_posts`: Track posted content
- `post_analytics`: Store engagement metrics

---

## ⏰ Scheduling

The scheduler runs scraping jobs automatically:

- **Monday 3:00 AM**: Weekly scrape #1
- **Thursday 3:00 AM**: Weekly scrape #2

Configure in `src/services/scheduler.ts`.

---

## 📖 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Migration Guide](./docs/MIGRATION_GUIDE.md)

---

## 🔒 Security

- All credentials stored in environment variables
- Service role key used for server-side operations
- RLS policies enforce organization data isolation

---

## 📄 License

Proprietary - All rights reserved.

