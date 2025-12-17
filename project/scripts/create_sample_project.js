import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = new URL('../.env', import.meta.url);
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
    if (m) {
      out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  try {
    // Create organization
    const orgName = `Sample Org ${new Date().toISOString()}`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: orgData, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug })
      .select()
      .single();

    if (orgErr) {
      console.error('Failed to create organization:', orgErr);
      process.exit(1);
    }

    console.log('Created organization:', orgData.id);

    // Create sample project
    const projectPayload = {
      organization_id: orgData.id,
      name: 'Sample Project - Pricing Test',
      description: null,
      status: 'planning',
      budget: 0,
      priority: 'medium',
      start_date: null,
      end_date: null,
      owner_id: null,
      created_by: null,
      custom_fields: {
        estimated_completion: '1-4-weeks',
        tools_used: [],
        proposed_tech: [],
        project_details: 'This is a sample project created by a test script to verify pricing calculation.',
        cost_to_operate: 100,
        gas_fee: 0
      }
    };

    const { data: projectData, error: projectErr } = await supabase
      .from('projects')
      .insert(projectPayload)
      .select()
      .single();

    if (projectErr) {
      console.error('Failed to create project:', projectErr);
      process.exit(1);
    }

    console.log('Created project:', projectData.id);
    console.log('Project details:', projectData);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

run();
