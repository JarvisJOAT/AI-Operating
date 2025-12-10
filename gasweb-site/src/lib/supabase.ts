/**
 * Supabase Client Configuration
 * 
 * Configures and exports the Supabase client for database operations,
 * authentication, and real-time subscriptions.
 * 
 * @module lib/supabase
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Supabase project URL from environment variables
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * Supabase anonymous key for client-side authentication
 */
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validate environment variables
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * Supabase client instance
 * 
 * Used throughout the application for:
 * - Database queries
 * - User authentication
 * - Real-time subscriptions
 * - File storage
 * 
 * @example
 * // Query data
 * const { data, error } = await supabase
 *   .from('courses')
 *   .select('*')
 *   .eq('status', 'published');
 * 
 * @example
 * // Authentication
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'dummy-key-for-development',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'gasweb-site',
      },
    },
  }
);

/**
 * Helper function to get the current user
 * 
 * @returns The current authenticated user or null
 * 
 * @example
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
}

/**
 * Helper function to sign out the current user
 * 
 * @returns Success status
 * 
 * @example
 * await signOut();
 * // User is now logged out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return false;
  }
  return true;
}

export default supabase;

