import { createClient } from '@supabase/supabase-js';

async function createProjectsTable() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Try to create projects table via direct RPC call
  // Since anon key can't execute arbitrary SQL, we'll use a workaround

  try {
    // Check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST205') {
      console.log('❌ Projects table does not exist');
      console.log('\nTo create the projects table, please:');
      console.log('1. Open Supabase Dashboard: https://app.supabase.com/project/wjkxlpwvzdfzsgqhhfsq/sql');
      console.log('2. Create a new query and paste the following SQL:');
      console.log(`
-- Create projects table with pricing columns
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  project_type text,
  hours numeric(10,2),
  cost_to_operate numeric(10,2),
  gas_fee numeric(10,2),
  budget numeric(10,2),
  addons_cost numeric(10,2),
  gas_plan text,
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  estimated_completion date,
  owner_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  custom_fields jsonb DEFAULT '{}'::jsonb
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
      `);
      console.log('3. Click "Run"');
      console.log('4. Once complete, the app will be ready to create projects!');
      process.exit(1);
    } else if (!checkError) {
      console.log('✅ Projects table exists!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createProjectsTable();
