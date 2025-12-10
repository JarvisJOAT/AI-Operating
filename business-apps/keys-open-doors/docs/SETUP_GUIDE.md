# Keys Open Doors Setup Guide

Complete setup instructions for the Keys Open Doors real estate automation application.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Chrome/Chromium** browser (for Selenium)
- **ChromeDriver** matching your Chrome version
- **Supabase account** (free tier works)
- **Instagram Business Account** (for posting)
- **OpenAI API key** (for caption generation)

## Quick Start

### 1. Clone and Navigate

```bash
cd AI-Operating/business-apps/keys-open-doors
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Configuration](#environment-configuration)).

### 4. Run Database Migrations

```bash
# From the AI-Operating root directory
cd ../../
npx supabase db push
```

### 5. Start the Server

```bash
# Development mode with hot reload
npm run dev

# Or production mode
npm run build
npm start
```

Server will start on `http://localhost:3001`

## Environment Configuration

### Required Environment Variables

```env
# ===================
# SERVER CONFIGURATION
# ===================
PORT=3001
NODE_ENV=development

# ===================
# ORGANIZATION
# ===================
# Your organization ID from the AI-Operating platform
ORGANIZATION_ID=your-organization-uuid

# ===================
# SUPABASE
# ===================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===================
# INVESTORLIFT CREDENTIALS
# ===================
INVESTORLIFT_EMAIL=your@email.com
INVESTORLIFT_PASSWORD=your-password
INVESTORLIFT_LOGIN_URL=https://investorlift.com/login
INVESTORLIFT_MARKETPLACE_URL=https://investorlift.com/marketplace

# ===================
# INVESTORLIFT FILTERS
# ===================
INVESTORLIFT_CITIES=Houston,Dallas,Austin,San Antonio
INVESTORLIFT_MIN_PRICE=50000
INVESTORLIFT_MAX_PRICE=500000

# ===================
# INSTAGRAM CONFIGURATION
# ===================
# Method: "instagrapi" or "graph_api"
INSTAGRAM_METHOD=graph_api

# For instagrapi method (personal accounts)
INSTAGRAM_USERNAME=your-instagram-username
INSTAGRAM_PASSWORD=your-instagram-password

# For Graph API method (business accounts)
INSTAGRAM_GRAPH_ACCESS_TOKEN=your-access-token
INSTAGRAM_GRAPH_PAGE_ID=your-page-id
INSTAGRAM_GRAPH_APP_ID=your-app-id
INSTAGRAM_GRAPH_APP_SECRET=your-app-secret

# Instagram posting settings
INSTAGRAM_USE_AI_CAPTIONS=true
INSTAGRAM_POST_TYPE=post
INSTAGRAM_DELAY_BETWEEN_POSTS=60
INSTAGRAM_POST_ALL_DEALS=false
INSTAGRAM_MAX_POSTS_PER_RUN=10
INSTAGRAM_FILTER_FACES=true

# ===================
# OPENAI
# ===================
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o
```

## InvestorLift Account Setup

### 1. Create Account

1. Go to [investorlift.com](https://investorlift.com)
2. Sign up for a wholesale buyer account
3. Complete profile verification

### 2. Configure Access

1. Enable marketplace access
2. Verify email
3. Set up preferred markets/locations

### 3. Note Credentials

Save your login credentials for the `.env` file:
- Email address
- Password

## Instagram API Setup

### Option A: Instagram Graph API (Recommended for Business)

#### Step 1: Facebook Business Setup

1. Go to [business.facebook.com](https://business.facebook.com)
2. Create or log in to your Business Manager
3. Add your Instagram Business account

#### Step 2: Create Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App"
3. Select "Business" → "Something Else"
4. Name your app (e.g., "Keys Open Doors Poster")

#### Step 3: Add Instagram Product

1. In your app dashboard, click "Add Product"
2. Select "Instagram Graph API"
3. Complete the setup wizard

#### Step 4: Generate Access Token

1. Go to Graph API Explorer
2. Select your app
3. Add permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`
4. Generate User Access Token
5. Convert to Page Access Token

#### Step 5: Get Page ID

```bash
# Using Graph API
curl -X GET "https://graph.facebook.com/v19.0/me/accounts?access_token=YOUR_TOKEN"

# Response includes page_id
```

#### Step 6: Update Environment

```env
INSTAGRAM_METHOD=graph_api
INSTAGRAM_GRAPH_ACCESS_TOKEN=your-long-lived-token
INSTAGRAM_GRAPH_PAGE_ID=your-page-id
INSTAGRAM_GRAPH_APP_ID=your-app-id
INSTAGRAM_GRAPH_APP_SECRET=your-app-secret
```

### Option B: Instagrapi (Personal Accounts)

⚠️ **Warning**: Using unofficial APIs may violate Instagram's Terms of Service.

```env
INSTAGRAM_METHOD=instagrapi
INSTAGRAM_USERNAME=your-username
INSTAGRAM_PASSWORD=your-password
```

## Selenium/ChromeDriver Setup

### Windows

1. **Install Chrome** (if not already installed)

2. **Download ChromeDriver**
   - Check your Chrome version: `chrome://settings/help`
   - Download matching ChromeDriver: [chromedriver.chromium.org](https://chromedriver.chromium.org/downloads)

3. **Add to PATH**
   ```powershell
   # Add ChromeDriver directory to PATH
   $env:Path += ";C:\path\to\chromedriver"
   ```

### macOS

```bash
# Using Homebrew
brew install --cask chromedriver

# If blocked by Gatekeeper
xattr -d com.apple.quarantine /usr/local/bin/chromedriver
```

### Linux

```bash
# Download and extract
wget https://chromedriver.storage.googleapis.com/LATEST_RELEASE
CHROMEDRIVER_VERSION=$(cat LATEST_RELEASE)
wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/

# Make executable
sudo chmod +x /usr/local/bin/chromedriver
```

### Docker Setup (Recommended for Production)

```dockerfile
# Dockerfile
FROM node:18-slim

# Install Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

CMD ["npm", "start"]
```

## Database Setup

### Apply Migrations

From the AI-Operating root:

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Apply migrations
npx supabase db push
```

### Verify Tables

Check these tables exist in Supabase:
- `scraping_jobs`
- `scraped_deals`
- `instagram_posts`
- `post_analytics`

### RLS Policies

Ensure Row Level Security is enabled and policies are active:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('scraping_jobs', 'scraped_deals', 'instagram_posts', 'post_analytics');
```

## OpenAI Setup

### 1. Create Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Add billing information

### 2. Generate API Key

1. Go to API Keys section
2. Click "Create new secret key"
3. Copy the key immediately (won't be shown again)

### 3. Configure Model

The default model is `gpt-4o`. To use a different model:

```env
OPENAI_MODEL=gpt-4-turbo-preview
# Or for cost savings:
OPENAI_MODEL=gpt-3.5-turbo
```

## First Run

### 1. Verify Configuration

```bash
# Start the server
npm run dev

# Check the health endpoint
curl http://localhost:3001/
# Should return: "Keys Open Doors API is running!"
```

### 2. Test Scraping

```bash
# Start a manual scraping job
curl -X POST http://localhost:3001/api/scraping/start
```

### 3. Check Results

```bash
# Get scraping job status
curl http://localhost:3001/api/scraping/status/{job-id}

# List scraped deals
curl http://localhost:3001/api/deals
```

### 4. Test Instagram Posting

```bash
# Post a specific deal
curl -X POST http://localhost:3001/api/posts/trigger/{deal-id}
```

## Scheduler Configuration

The default scheduler runs:
- **Monday** at 3:00 AM
- **Thursday** at 3:00 AM

To modify the schedule, edit `src/services/scheduler.ts`:

```typescript
// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  // scraping logic
});

// Run every 12 hours
cron.schedule('0 */12 * * *', async () => {
  // scraping logic
});
```

## Troubleshooting

### Common Issues

#### Chrome/Selenium Issues

**Error: "ChromeDriver version mismatch"**
```bash
# Check Chrome version
google-chrome --version

# Download matching ChromeDriver version
```

**Error: "Chrome not found"**
```env
# Specify Chrome binary path
CHROME_BIN=/path/to/google-chrome
```

#### Instagram Issues

**Error: "Login challenge required"**
- Instagram may require additional verification
- Try logging in manually first
- Use Graph API instead of instagrapi

**Error: "Rate limit exceeded"**
- Increase `INSTAGRAM_DELAY_BETWEEN_POSTS`
- Reduce `INSTAGRAM_MAX_POSTS_PER_RUN`

#### InvestorLift Issues

**Error: "Failed to login"**
- Verify credentials are correct
- Check if account is active
- Try logging in manually to check for CAPTCHA

**Error: "No deals found"**
- Verify city filters are correct
- Check price range filters
- Ensure marketplace has listings

### Debug Mode

Enable verbose logging:

```env
NODE_ENV=development
DEBUG=keys-open-doors:*
```

### Log Files

Check logs at:
- Console output (development)
- `logs/` directory (if configured)
- Supabase Dashboard → Logs

## Security Considerations

### Credential Protection

- Never commit `.env` files
- Use secrets management in production
- Rotate API keys regularly

### Rate Limiting

- Instagram: Max 25 posts per day
- InvestorLift: Respect robots.txt
- OpenAI: Monitor usage and costs

### Data Privacy

- Don't store sensitive customer data
- Comply with platform ToS
- Implement proper data retention policies

---

## Next Steps

1. [Architecture Overview](./ARCHITECTURE.md)
2. [API Reference](./API_REFERENCE.md)
3. [User Manual](./USER_MANUAL.md)
4. [Migration Guide](./MIGRATION_GUIDE.md) (if migrating from old scraper)

