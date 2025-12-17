import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    // Read the migration file
    const migrationContent = fs.readFileSync(
      './supabase/migrations/20251114035325_create_project_management_schema.sql',
      'utf-8'
    );

    // Extract just the CREATE TABLE statements
    const createTableRegex = /CREATE TABLE.*?;/gs;
    const createIndexRegex = /CREATE INDEX.*?;/gs;
    
    const statements = [...migrationContent.matchAll(createTableRegex)].map(m => m[0])
      .concat([...migrationContent.matchAll(createIndexRegex)].map(m => m[0]));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log('Executing:', statement.substring(0, 50) + '...');
          const { data, error } = await supabase.rpc('exec', { sql: statement });
          if (error) {
            console.error('Error:', error.message);
          } else {
            console.log('Success');
          }
        } catch (e) {
          console.error('Exception:', e.message);
        }
      }
    }

    console.log('\nSchema application complete!');
  } catch (error) {
    console.error('Failed to apply schema:', error);
  }
}

applySchema();
