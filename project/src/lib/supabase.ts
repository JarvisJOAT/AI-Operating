import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== SUPABASE DEBUG ===');
console.log('All env vars:', import.meta.env);
console.log('URL from env:', import.meta.env.VITE_SUPABASE_URL);
console.log('Final URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length);
console.log('======================');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

supabase.from('organizations').select('count', { count: 'exact', head: true })
  .then(({ error, count }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('✓ Supabase connected successfully! Organizations count:', count);
    }
  });
