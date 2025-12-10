/**
 * Supabase Client
 * 
 * Configures and exports Supabase client for database operations.
 * 
 * @module utils/supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Database } from '../types/database';

/**
 * Supabase client instance
 * 
 * Uses service role key for server-side operations with full access.
 * 
 * @example
 * import { supabase } from './utils/supabase';
 * 
 * const { data, error } = await supabase
 *   .from('scraped_deals')
 *   .select('*')
 *   .limit(10);
 */
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;

