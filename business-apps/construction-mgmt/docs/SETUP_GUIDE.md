# Construction Management App Setup Guide

Complete setup instructions for the Construction Management application with real-time translation, OCR receipt processing, and expense tracking.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Supabase Account** (for database and file storage)
- **Google Cloud Account** (for Translation API and Vision API)
  - OR **AWS Account** (for Textract)
  - OR **DeepL API** (for translation)

## Quick Start

### 1. Navigate to Project

```bash
cd AI-Operating/business-apps/construction-mgmt
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

Server runs on `http://localhost:3003`

## Environment Configuration

### Complete .env Template

```env
# ===================
# SERVER
# ===================
PORT=3003
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
# TRANSLATION SERVICES
# ===================
# Google Cloud Translation (recommended)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR use API key
GOOGLE_TRANSLATE_API_KEY=your-api-key

# DeepL (alternative)
DEEPL_API_KEY=your-deepl-api-key
DEEPL_FREE_API=true

# Primary translation service (google or deepl)
TRANSLATION_SERVICE=google

# ===================
# OCR SERVICES
# ===================
# Google Vision (recommended)
GOOGLE_VISION_API_KEY=your-api-key
# OR use service account (same as Translation)

# AWS Textract (alternative)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Primary OCR service (google or aws)
OCR_SERVICE=google

# ===================
# FILE STORAGE
# ===================
# Supabase Storage (default)
STORAGE_BUCKET=construction-documents
MAX_FILE_SIZE=50  # MB

# ===================
# EMAIL (Notifications)
# ===================
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_FROM=construction@yourcompany.com

# ===================
# OPENAI (for intelligent extraction)
# ===================
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o

# ===================
# CACHING
# ===================
REDIS_URL=redis://localhost:6379  # Optional, for translation caching
TRANSLATION_CACHE_TTL=86400  # 24 hours
```

## Translation API Setup

### Option 1: Google Cloud Translation (Recommended)

#### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable billing for the project

#### 2. Enable Translation API

1. Go to APIs & Services → Library
2. Search for "Cloud Translation API"
3. Click "Enable"

#### 3. Create Service Account

1. Go to IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `construction-app-translator`
4. Role: `Cloud Translation API User`
5. Click "Create and Continue"
6. Click "Done"

#### 4. Generate Key

1. Click on the service account
2. Go to "Keys" tab
3. Add Key → Create new key
4. Select JSON
5. Save the file securely

#### 5. Configure Environment

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
TRANSLATION_SERVICE=google
```

### Option 2: DeepL API

#### 1. Create Account

1. Go to [DeepL Pro](https://www.deepl.com/pro)
2. Sign up for API access
3. Choose Free or Pro tier

#### 2. Get API Key

1. Go to Account → API Keys
2. Copy your authentication key

#### 3. Configure Environment

```env
DEEPL_API_KEY=your-api-key
DEEPL_FREE_API=true  # Set to false for Pro API
TRANSLATION_SERVICE=deepl
```

### Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `pt` | Portuguese |
| `fr` | French |
| `de` | German |
| `zh` | Chinese |
| `ja` | Japanese |
| `ko` | Korean |
| `ar` | Arabic |
| `ru` | Russian |
| `vi` | Vietnamese |
| `tl` | Tagalog |

## OCR Service Setup

### Option 1: Google Cloud Vision (Recommended)

#### 1. Enable Vision API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Library
3. Search for "Cloud Vision API"
4. Click "Enable"

#### 2. Add Vision API to Service Account

If you already have a service account:
1. Go to IAM & Admin → IAM
2. Find your service account
3. Edit → Add another role
4. Add "Cloud Vision API User"

#### 3. Configure Environment

```env
OCR_SERVICE=google
# Uses same credentials as Translation API
```

### Option 2: AWS Textract

#### 1. Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam)
2. Users → Add User
3. Name: `construction-app-ocr`
4. Access type: Programmatic access

#### 2. Attach Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:DetectDocumentText",
        "textract:AnalyzeDocument",
        "textract:AnalyzeExpense"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3. Configure Environment

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
OCR_SERVICE=aws
```

## File Storage Setup

### Supabase Storage (Default)

#### 1. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `construction-documents`
4. Set to "Private"

#### 2. Configure Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'construction-documents' AND
  auth.role() = 'authenticated'
);

-- Allow users to view their organization's documents
CREATE POLICY "Users can view their documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'construction-documents' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM project_members
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- Allow document download
CREATE POLICY "Users can download their documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'construction-documents' AND
  auth.role() = 'authenticated'
);
```

### Alternative: AWS S3

If using S3 instead of Supabase Storage:

```env
AWS_S3_BUCKET=construction-documents-bucket
AWS_S3_REGION=us-east-1
USE_S3_STORAGE=true
```

## Database Schema

### Required Tables

1. **construction_projects** - Project information
2. **project_tasks** - Tasks within projects
3. **project_members** - Team members and roles
4. **receipts** - Uploaded receipt documents
5. **expenses** - Extracted expense data
6. **messages** - Team chat messages
7. **message_translations** - Cached translations
8. **document_versions** - Document versioning

### Apply Migrations

```bash
cd AI-Operating
npx supabase migration up

# Or manually run:
npx supabase db push
```

## OpenAI Setup (Optional)

For intelligent data extraction from receipts:

### 1. Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. API Keys → Create new secret key
3. Copy the key

### 2. Configure Environment

```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o
```

### What OpenAI Enables

- Smart receipt parsing
- Category suggestions
- Expense categorization
- Natural language task descriptions
- Translation improvement

## Testing the Setup

### Test Translation

```bash
curl -X POST http://localhost:3003/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "targetLanguage": "es"
  }'

# Expected: {"translatedText": "Hola, ¿cómo estás?", "sourceLanguage": "en"}
```

### Test OCR

```bash
curl -X POST http://localhost:3003/api/ocr/process \
  -F "file=@receipt.jpg"

# Expected: {"text": "...", "confidence": 0.95, "structuredData": {...}}
```

### Test File Upload

```bash
curl -X POST http://localhost:3003/api/documents/upload \
  -H "Authorization: Bearer your-token" \
  -F "file=@document.pdf" \
  -F "projectId=project-uuid"
```

## Verifying Services

### Check Translation Service

```typescript
// In your code or through API
import { translateText } from './services/translation';

const result = await translateText('Hello', 'es');
console.log(result); // "Hola"
```

### Check OCR Service

```typescript
import { processReceipt } from './services/ocr';

const result = await processReceipt(imageBuffer);
console.log(result.structuredData);
// { vendor: "Home Depot", total: 156.78, date: "2024-01-15" }
```

## Troubleshooting

### Translation Issues

**"API quota exceeded"**
- Check Google Cloud billing
- Increase quotas in Cloud Console
- Enable caching to reduce API calls

**"Invalid credentials"**
- Verify service account key path
- Check API key validity
- Ensure APIs are enabled

**"Language not supported"**
- Check supported languages list
- Use language codes (e.g., "es" not "Spanish")

### OCR Issues

**"Image quality too low"**
- Minimum resolution: 300 DPI
- Ensure good lighting
- Avoid blurry images

**"Unable to extract text"**
- Check file format (JPEG, PNG, PDF)
- Verify file isn't corrupted
- Try increasing image contrast

**"Structured data extraction failed"**
- Receipt may be in unsupported format
- Use manual correction interface
- Provide feedback for improvement

### Storage Issues

**"File too large"**
- Check MAX_FILE_SIZE setting
- Compress before uploading
- Contact admin for larger limits

**"Permission denied"**
- Verify storage policies
- Check authentication token
- Confirm organization membership

### Connection Issues

**"Database connection failed"**
- Verify Supabase URL and keys
- Check network connectivity
- Review RLS policies

---

## Next Steps

1. [Translation System Guide](./TRANSLATION_SYSTEM.md)
2. [OCR Guide](./OCR_GUIDE.md)
3. [API Reference](./API_REFERENCE.md)
4. [User Manual](./USER_MANUAL.md)

