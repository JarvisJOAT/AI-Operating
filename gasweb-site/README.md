# 🌐 Gasweb.info - AI Automation & Education Platform

> **Marketing website for GAS AI automation services** featuring educational content, service showcases, and a Linktree-style landing page builder.

[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)

---

## 🎯 Overview

Gasweb.info serves as the public-facing website for GAS AI automation services, providing:

- **Service Showcase**: AI automation services for small businesses
- **Education Platform**: Free and paid courses on AI implementation
- **Landing Page Builder**: Linktree-style customizable landing pages
- **Case Studies**: Success stories and testimonials

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
gasweb-site/
├── src/
│   ├── components/
│   │   └── Layout.tsx         # Main layout with navigation
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── Services.tsx       # AI services showcase
│   │   ├── Education.tsx      # Course catalog
│   │   ├── CaseStudies.tsx    # Testimonials
│   │   ├── Contact.tsx        # Contact form
│   │   ├── LandingPage.tsx    # Dynamic Linktree-style page
│   │   └── admin/
│   │       └── LandingPageAdmin.tsx  # Admin panel
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── database.types.ts  # TypeScript types
│   ├── App.tsx                # Router configuration
│   └── main.tsx               # Entry point
├── public/
├── index.html
└── package.json
```

---

## 🔧 Configuration

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

---

## 📚 Features

### Home Page
- Hero section with CTA
- Services overview
- Education preview
- Testimonials

### Services Page
- Email automation
- Data entry AI
- Chatbot development
- N8N workflow integration

### Education Platform
- Free courses
- Paid courses (one-time/subscription)
- Video content
- PDF downloads

### Landing Page Builder
- Dynamic link management
- Video embeds
- Customizable themes
- Analytics tracking

---

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)

---

## 🚢 Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Deploy to Netlify
netlify deploy --prod
```

---

## 📄 License

Proprietary - All rights reserved.

