#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client using a service role key if available, or use anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  try {
    // First, let's check if projects table exists
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✓ Projects table already exists!');
      return;
    }

    if (error.message.includes('relation "public.projects" does not exist')) {
      console.log('Projects table does not exist. Creating...');
      
      // Read migration file
      const migration = fs.readFileSync(
        './supabase/migrations/20251114035325_create_project_management_schema.sql',
        'utf-8'
      );

      // Split by statements and filter out comments
      const statements = migration
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));

      console.log(`Found ${statements.length} SQL statements`);

      // Try to execute using RPC or direct PostgREST
      // Since we don't have direct SQL execution through PostgREST, we'll try a different approach
      console.log('\nNote: Unable to execute raw SQL through Supabase anon key.');
      console.log('Please use the Supabase Dashboard to run the migration manually:');
      console.log('1. Go to https://app.supabase.com/project/wjkxlpwvzdfzsgqhhfsq/sql');
      console.log('2. Paste the contents of: supabase/migrations/20251114035325_create_project_management_schema.sql');
      console.log('3. Click "Run"');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

executeMigration();
