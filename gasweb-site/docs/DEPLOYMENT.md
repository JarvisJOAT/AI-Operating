# Gasweb.info Deployment Guide

This guide covers deploying the Gasweb.info application to production environments.

## Deployment Overview

The recommended deployment stack:

| Component | Service | Purpose |
|-----------|---------|---------|
| **Frontend** | Vercel / Netlify | Static hosting, CDN |
| **Database** | Supabase (hosted) | PostgreSQL, Auth |
| **File Storage** | Supabase Storage | Course content |
| **Payments** | Stripe / PayPal | Payment processing |
| **Domain** | Your registrar | Custom domain |

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] Database migrations are up to date
- [ ] RLS policies are correctly set
- [ ] Payment webhooks are configured
- [ ] Custom domain DNS is ready
- [ ] SSL certificate is ready (auto-handled by Vercel/Netlify)
- [ ] Production API keys are ready

## Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

Create `vercel.json` in `gasweb-site/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Step 4: Set Environment Variables

```bash
# Set each environment variable
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_PAYPAL_CLIENT_ID
```

Or configure in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables for Production, Preview, and Development

### Step 5: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 6: Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Domains
2. Add `www.gasweb.info` and `gasweb.info`
3. Update DNS records:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

## Netlify Deployment (Alternative)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login and Initialize

```bash
netlify login
netlify init
```

### Step 3: Configure Build

Create `netlify.toml` in `gasweb-site/`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[build.environment]
  NODE_VERSION = "18"
```

### Step 4: Set Environment Variables

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
# ... other variables
```

### Step 5: Deploy

```bash
# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Step 6: Configure Custom Domain

1. Go to Netlify Dashboard → Domain settings
2. Add custom domain `www.gasweb.info`
3. Configure DNS as instructed

## Supabase Production Configuration

### Enable Production Mode

1. Go to Supabase Dashboard → Settings → General
2. Disable "Pause project after 7 days of inactivity"
3. Consider upgrading to Pro plan for:
   - Daily backups
   - No pausing
   - Higher limits

### Configure Auth Settings

1. Go to Authentication → URL Configuration
2. Set Site URL: `https://www.gasweb.info`
3. Add Redirect URLs:
   - `https://www.gasweb.info/auth/callback`
   - `https://www.gasweb.info`

### Configure Storage

1. Go to Storage → Policies
2. Ensure production-appropriate policies are set
3. Configure CORS for your domain

### Configure API Settings

1. Go to Settings → API
2. Add your domain to allowed origins
3. Review rate limiting settings

## Payment Webhook Configuration

### Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://www.gasweb.info/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret → Update environment variable

### PayPal Webhooks

1. Go to PayPal Developer Dashboard
2. Navigate to your app → Webhooks
3. Add webhook URL: `https://www.gasweb.info/api/webhooks/paypal`
4. Select events:
   - Payment capture completed
   - Subscription activated
   - Subscription cancelled

## SSL Certificate

### Vercel (Automatic)
- SSL is automatically provisioned and renewed
- No configuration needed

### Netlify (Automatic)
- SSL is automatically provisioned via Let's Encrypt
- No configuration needed

### Custom SSL (if needed)
```bash
# Using Let's Encrypt manually
certbot certonly --webroot -w /path/to/webroot -d www.gasweb.info -d gasweb.info
```

## Monitoring & Analytics

### Set Up Error Monitoring

Add Sentry for error tracking:

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### Set Up Analytics

Add Google Analytics:

```typescript
// Add to index.html or use gtag.js
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

### Set Up Uptime Monitoring

Recommended services:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

Configure monitors for:
- `https://www.gasweb.info` (homepage)
- `https://www.gasweb.info/api/health` (API health)

## Performance Optimization

### Enable Compression

Vercel and Netlify handle this automatically. For custom servers:

```javascript
// Express example
const compression = require('compression');
app.use(compression());
```

### Configure Caching

Already configured in `vercel.json`/`netlify.toml`. Key headers:

```
# Static assets (images, fonts, etc.)
Cache-Control: public, max-age=31536000, immutable

# HTML files
Cache-Control: public, max-age=0, must-revalidate

# API responses
Cache-Control: private, max-age=0, no-cache
```

### Enable CDN

Both Vercel and Netlify include global CDN. For custom deployments:
- Use Cloudflare
- Configure AWS CloudFront
- Use Fastly

## Security Checklist

### Before Going Live

- [ ] Remove all `console.log` statements
- [ ] Enable HTTPS only (redirect HTTP)
- [ ] Configure Content Security Policy
- [ ] Set up rate limiting
- [ ] Review RLS policies
- [ ] Audit API endpoints
- [ ] Remove debug/test data
- [ ] Configure CORS properly

### Security Headers

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com;"
        }
      ]
    }
  ]
}
```

## Deployment Pipeline (CI/CD)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    paths:
      - 'gasweb-site/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'gasweb-site/package-lock.json'
      
      - name: Install dependencies
        working-directory: gasweb-site
        run: npm ci
      
      - name: Run tests
        working-directory: gasweb-site
        run: npm test
      
      - name: Build
        working-directory: gasweb-site
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: gasweb-site
          vercel-args: '--prod'
```

## Rollback Procedures

### Vercel Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

Or via Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Netlify Rollback

```bash
# List deploys
netlify deploys

# Rollback
netlify deploy --prod --build false --dir=path/to/previous/build
```

Or via Dashboard:
1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

### Database Rollback

```bash
# Restore from backup (Supabase Pro)
# Go to Dashboard → Database → Backups → Restore

# Manual rollback using migrations
npx supabase db reset  # CAUTION: This resets all data
```

## Post-Deployment Verification

After each deployment:

1. **Test Critical Paths**
   - Homepage loads
   - Course catalog loads
   - Payment flow works (use test mode)
   - User authentication works
   - Contact form submits

2. **Check Performance**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Verify CDN is working

3. **Monitor**
   - Watch error logs for 30 minutes
   - Check analytics for anomalies
   - Verify webhook deliveries

## Support & Troubleshooting

### Common Deployment Issues

**Build fails with "Out of memory"**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Environment variables not loading**
- Ensure variables start with `VITE_`
- Rebuild after changing env vars
- Check variable spelling

**404 on page refresh (SPA routing)**
- Ensure redirects are configured
- Check `vercel.json` or `netlify.toml`

**API calls failing in production**
- Check CORS configuration
- Verify Supabase URL is production
- Check API keys are production keys

---

For additional support, check [Vercel Documentation](https://vercel.com/docs) or [Netlify Documentation](https://docs.netlify.com).

