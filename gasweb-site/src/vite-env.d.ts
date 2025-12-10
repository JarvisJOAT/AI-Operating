/// <reference types="vite/client" />

/**
 * Environment Variable Type Definitions
 * 
 * Defines the shape of environment variables used in the application.
 * Add new environment variables here for type safety.
 */
interface ImportMetaEnv {
  /** Supabase project URL */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anonymous key for client-side auth */
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Stripe publishable key for payments */
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  /** PayPal client ID */
  readonly VITE_PAYPAL_CLIENT_ID: string;
  /** Application environment */
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

