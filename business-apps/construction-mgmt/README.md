# 🏗️ Construction Manager - Multilingual Project Management

> **Construction project management platform** with OCR receipts and real-time translation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![Google Cloud](https://img.shields.io/badge/Google-Cloud-blue)](https://cloud.google.com/)

---

## 🎯 Overview

Comprehensive construction management featuring:

- **Project Management**: Full project lifecycle tracking
- **Task Management**: Kanban board with assignments
- **Receipt OCR**: Automatic expense extraction
- **Real-time Translation**: Multilingual team communication
- **Document Versioning**: Track document changes

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev  # Runs on port 3003
```

---

## 📁 Project Structure

```
construction-mgmt/
├── src/
│   ├── routes/
│   │   ├── projects.ts      # Project management
│   │   ├── tasks.ts         # Task management
│   │   ├── receipts.ts      # Receipt upload & OCR
│   │   ├── expenses.ts      # Expense tracking
│   │   ├── messages.ts      # Team messaging
│   │   ├── translation.ts   # Translation API
│   │   ├── documents.ts     # Document versioning
│   │   └── members.ts       # Team management
│   ├── services/
│   │   ├── ocr.ts           # Google Vision OCR
│   │   └── translation.ts   # Google Translate
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
PORT=3003
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Cloud (OCR & Translation)
GOOGLE_CLOUD_KEY_FILE=./credentials.json
GOOGLE_TRANSLATE_API_KEY=your_translate_key

# File Storage
STORAGE_BUCKET=documents
```

---

## 📡 API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| GET | `/api/projects/:id/stats` | Project statistics |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:projectId` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/assign` | Assign task |

### Receipts & OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/receipts/upload` | Upload receipt |
| GET | `/api/receipts/:projectId` | List receipts |
| PATCH | `/api/receipts/:id` | Update OCR data |

### Translation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translation/translate` | Translate text |
| POST | `/api/translation/detect` | Detect language |
| GET | `/api/translation/languages` | List languages |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:projectId` | Get messages |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:id/translate` | Get translation |

---

## 🌐 Supported Languages

- English, Spanish, Portuguese
- French, German, Italian
- Chinese, Japanese, Korean
- Russian, Ukrainian, Polish
- Arabic, Hindi, Vietnamese
- And 10+ more...

---

## 📸 OCR Features

- Automatic vendor name extraction
- Amount detection
- Date parsing
- Tax calculation
- Line item extraction

Supported formats: JPEG, PNG, PDF

---

## 📖 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Translation System](./docs/TRANSLATION_SYSTEM.md)
- [OCR Guide](./docs/OCR_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)

---

## 📄 License

Proprietary - All rights reserved.

