# AI-Operating Deployment Strategy

Complete deployment guide for the AI-Operating platform and business applications.

## Overview

This document covers deployment strategies for:
1. **AI-Operating Platform** - Central management system
2. **Gasweb.info** - Marketing website
3. **Business Applications** - Keys Open Doors, Food Truck, Construction Management

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Production Environment                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌────────────────┐                    ┌────────────────┐             │
│    │   Cloudflare   │                    │   Cloudflare   │             │
│    │      CDN       │                    │   DNS + WAF    │             │
│    └───────┬────────┘                    └───────┬────────┘             │
│            │                                     │                       │
│    ┌───────▼────────┐    ┌────────────┐   ┌─────▼──────────┐           │
│    │    Vercel      │    │  Railway   │   │     Render     │           │
│    │   (Frontend)   │    │  (Backend) │   │   (Workers)    │           │
│    │                │    │            │   │                │           │
│    │ • AI-Operating │    │ • API      │   │ • Schedulers   │           │
│    │ • Gasweb.info  │    │ • Webhooks │   │ • Background   │           │
│    └───────┬────────┘    └─────┬──────┘   └────────────────┘           │
│            │                   │                                        │
│            └─────────┬─────────┘                                        │
│                      │                                                   │
│              ┌───────▼───────┐                                          │
│              │   Supabase    │                                          │
│              │  (Database)   │                                          │
│              │               │                                          │
│              │ • PostgreSQL  │                                          │
│              │ • Auth        │                                          │
│              │ • Storage     │                                          │
│              │ • Realtime    │                                          │
│              └───────────────┘                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Environment Strategy

### Environments

| Environment | Purpose | URL Pattern |
|-------------|---------|-------------|
| Development | Local development | localhost:* |
| Staging | Pre-production testing | staging.*.com |
| Production | Live environment | *.com |

### Environment Variables

```bash
# .env.production
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# External APIs
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=AC...
STRIPE_SECRET_KEY=sk_live_...

# Application URLs
AI_OPERATING_URL=https://app.your-domain.com
GASWEB_URL=https://www.gasweb.info
KEYS_APP_URL=https://keys.your-domain.com
FOOD_TRUCK_URL=https://food.your-domain.com
CONSTRUCTION_URL=https://construction.your-domain.com
```

## Deployment Order

Deploy components in this order to ensure dependencies are met:

```
1. Database & Auth (Supabase)
         │
         ▼
2. Backend APIs (Railway/Render)
         │
         ▼
3. Frontend Apps (Vercel)
         │
         ▼
4. Business Apps (Individual deployments)
         │
         ▼
5. DNS & SSL (Cloudflare)
         │
         ▼
6. Monitoring & Alerts
```

## Supabase Deployment

### 1. Create Production Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref
```

### 2. Apply Migrations

```bash
# Push migrations to production
supabase db push

# Verify migration status
supabase db remote status
```

### 3. Configure Auth

1. Go to Supabase Dashboard → Authentication
2. Configure providers:
   - Email/Password
   - Google OAuth
   - GitHub OAuth (optional)
3. Set redirect URLs:
   ```
   https://app.your-domain.com/auth/callback
   https://www.gasweb.info/auth/callback
   ```

### 4. Configure Storage

1. Create buckets:
   - `avatars` - User profile images
   - `documents` - Project documents
   - `receipts` - Receipt uploads
   - `assets` - Public assets

2. Set policies:
   ```sql
   -- Public read for assets
   CREATE POLICY "Public assets are viewable"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'assets');
   
   -- Authenticated upload for receipts
   CREATE POLICY "Users can upload receipts"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'receipts' AND
     auth.role() = 'authenticated'
   );
   ```

## Frontend Deployment (Vercel)

### AI-Operating Platform

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd AI-Operating/project
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### vercel.json

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

### Gasweb.info

```bash
cd AI-Operating/gasweb-site
vercel --prod
```

### Custom Domains

1. Add domain in Vercel
2. Configure DNS:
   ```
   A     @      76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```

## Backend Deployment (Railway)

### Setup

1. Connect GitHub repository
2. Select the service directory
3. Configure build settings:

```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Environment Configuration

Set in Railway dashboard:
- All environment variables
- Custom domain
- Region selection

### Scaling

```yaml
# Configure autoscaling
replicas:
  min: 1
  max: 5
  target_cpu: 70
```

## Business Apps Deployment

### Keys Open Doors

```bash
cd AI-Operating/business-apps/keys-open-doors

# Build
npm run build

# Deploy to Railway
railway up
```

### Food Truck

```bash
cd AI-Operating/business-apps/food-truck

# Deploy
railway up

# Configure Twilio webhooks
# Update: https://food.your-domain.com/api/voice/incoming
```

### Construction Management

```bash
cd AI-Operating/business-apps/construction-mgmt

# Deploy
railway up
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint

  deploy-staging:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ai-operating-api
```

## Monitoring Setup

### Health Checks

```typescript
// health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    database: await checkDatabase(),
    cache: await checkCache(),
  });
});
```

### Uptime Monitoring (UptimeRobot/Pingdom)

Configure monitors for:
- `https://app.your-domain.com/health`
- `https://www.gasweb.info`
- `https://keys.your-domain.com/health`
- `https://food.your-domain.com/health`
- `https://construction.your-domain.com/health`

### Error Tracking (Sentry)

```typescript
// sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### Logging (Logtail/Datadog)

```typescript
// logger.ts
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

export const logger = {
  info: (message: string, context?: object) => {
    logtail.info(message, context);
  },
  error: (message: string, error?: Error, context?: object) => {
    logtail.error(message, { error: error?.stack, ...context });
    Sentry.captureException(error);
  },
};
```

## Rollback Procedures

### Frontend Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Backend Rollback (Railway)

1. Go to Railway dashboard
2. Select deployment history
3. Click "Rollback" on previous deployment

### Database Rollback

```bash
# List migrations
supabase db remote status

# Rollback last migration
supabase db reset --linked

# Apply specific migration
supabase db push --target-version 20240101000000
```

### Emergency Procedures

1. **Site Down**
   - Check Vercel status
   - Check Railway status
   - Check Supabase status
   - Review error logs

2. **Database Issues**
   - Enable read-only mode
   - Scale up resources
   - Contact Supabase support

3. **Security Incident**
   - Rotate API keys
   - Review audit logs
   - Enable maintenance mode

## Post-Deployment Checklist

- [ ] Verify all endpoints responding
- [ ] Check SSL certificates
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Test webhook endpoints
- [ ] Confirm email delivery
- [ ] Verify SMS delivery
- [ ] Check payment processing
- [ ] Review error rates
- [ ] Confirm logging working
- [ ] Test rollback procedure

---

## Related Documentation

- [AI-Operating Integration](./AI_OPERATING_INTEGRATION.md)
- [API Reference](./API_REFERENCE.md)
- [Admin Dashboard Guide](../admin-training/ADMIN_DASHBOARD_GUIDE.md)

