# Gasweb.info Setup Guide

This guide provides step-by-step instructions for setting up the Gasweb.info development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recommended) or preferred IDE
- **Supabase CLI** (optional, for local development)

## Quick Start

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/your-org/AI-Operating.git

# Navigate to gasweb-site
cd AI-Operating/gasweb-site
```

### 2. Install Dependencies

```bash
# Install npm packages
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `gasweb-site` directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# ===================
# SUPABASE CONFIGURATION
# ===================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ===================
# PAYMENT PROVIDERS
# ===================
# Stripe (for card payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (for alternative payments)
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
VITE_PAYPAL_SANDBOX=true

# Crypto payments
VITE_CRYPTO_WALLET_ADDRESS=your-wallet-address
VITE_CRYPTO_NETWORK=mainnet

# ===================
# ANALYTICS (Optional)
# ===================
VITE_GA_TRACKING_ID=UA-XXXXX-X
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Detailed Configuration

### Supabase Setup

#### Option A: Use Hosted Supabase (Recommended)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new project (note down the password)

2. **Get Your API Keys**
   - Go to Settings → API
   - Copy the `Project URL` → `VITE_SUPABASE_URL`
   - Copy the `anon public` key → `VITE_SUPABASE_ANON_KEY`

3. **Run Database Migrations**
   ```bash
   # Navigate to the project root
   cd ../
   
   # Link to your Supabase project
   npx supabase link --project-ref your-project-ref
   
   # Push migrations
   npx supabase db push
   ```

#### Option B: Local Supabase Development

1. **Install Supabase CLI**
   ```bash
   # macOS
   brew install supabase/tap/supabase

   # Windows (with scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # npm (all platforms)
   npm install -g supabase
   ```

2. **Start Local Supabase**
   ```bash
   # Navigate to project root
   cd AI-Operating

   # Start Supabase services
   npx supabase start
   ```

3. **Update Environment Variables**
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<local-anon-key-from-output>
   ```

### Payment Provider Setup

#### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for an account
   - Navigate to Developers → API Keys

2. **Get API Keys**
   - Copy `Publishable key` → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Keep `Secret key` secure (used in webhook handlers)

3. **Set Up Webhooks** (for production)
   ```bash
   # Test locally with Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Configure Products**
   - Create products in Stripe Dashboard for courses
   - Note the price IDs for integration

#### PayPal Setup

1. **Create PayPal Developer Account**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Create sandbox and production apps

2. **Get Client ID**
   - Navigate to My Apps & Credentials
   - Create a new app or use default
   - Copy Client ID → `VITE_PAYPAL_CLIENT_ID`

3. **Configure Sandbox Mode**
   ```env
   VITE_PAYPAL_SANDBOX=true  # Set to false for production
   ```

#### Crypto Payment Setup

1. **Set Up Wallet**
   - Create a wallet for receiving payments
   - Copy wallet address → `VITE_CRYPTO_WALLET_ADDRESS`

2. **Configure Network**
   ```env
   VITE_CRYPTO_NETWORK=testnet  # Use mainnet for production
   ```

### File Storage Setup

For course content (videos, PDFs):

1. **Create Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket named `course-content`
   - Set bucket to private

2. **Configure Storage Policies**
   ```sql
   -- Allow authenticated users to read purchased content
   CREATE POLICY "Users can access purchased course content"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'course-content' 
     AND auth.uid() IN (
       SELECT user_id FROM course_enrollments 
       WHERE course_id = (storage.foldername(name))[1]::uuid
     )
   );
   ```

## Development Tools

### VS Code Extensions

Recommended extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "mikestead.dotenv",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

## Verification

### Test Database Connection

```typescript
// Run in browser console or create a test file
import { supabase } from './lib/supabase';

const testConnection = async () => {
  const { data, error } = await supabase.from('courses').select('count');
  console.log(error ? 'Connection failed' : 'Connection successful');
};

testConnection();
```

### Test Payment Integration

```typescript
// Test Stripe integration
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log(stripe ? 'Stripe loaded' : 'Stripe failed to load');
```

### Run Development Checks

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build (to verify no build errors)
npm run build
```

## Common Issues & Troubleshooting

### Issue: "VITE_SUPABASE_URL is not defined"

**Solution:**
1. Ensure `.env` file exists in `gasweb-site/` directory
2. Verify environment variable names start with `VITE_`
3. Restart the development server after changing `.env`

### Issue: "Failed to fetch courses"

**Solution:**
1. Check Supabase connection in browser Network tab
2. Verify RLS policies are correctly set up
3. Ensure migrations have been run

### Issue: "Stripe element failed to mount"

**Solution:**
1. Verify `VITE_STRIPE_PUBLISHABLE_KEY` is correct
2. Check for ad blockers that might block Stripe
3. Ensure you're using HTTPS in production

### Issue: "CORS error when connecting to Supabase"

**Solution:**
1. Add your development URL to Supabase allowed origins
2. Go to Supabase Dashboard → Settings → API → CORS settings
3. Add `http://localhost:5173` to allowed origins

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After completing setup:

1. **Read the Architecture Documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md)

2. **Understand Development Workflow**
   - [DEVELOPMENT.md](./DEVELOPMENT.md)

3. **Learn About Content Management**
   - [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md)

4. **Prepare for Deployment**
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

## Support

If you encounter issues not covered in this guide:

1. Check the GitHub Issues page
2. Review Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
3. Review Vite documentation: [vitejs.dev](https://vitejs.dev)
4. Contact the development team

