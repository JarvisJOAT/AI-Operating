/*
  # CRM and Contact Management Schema
  
  ## Overview
  This migration creates the CRM system supporting contacts, companies, deals, pipelines,
  and activity tracking for comprehensive customer relationship management.
  
  ## New Tables
  
  ### `companies`
  - `id` (uuid, primary key) - Unique company identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Company name
  - `domain` (text) - Company website domain
  - `industry` (text) - Industry classification
  - `size` (text) - Company size: startup, small, medium, large, enterprise
  - `phone` (text) - Primary phone number
  - `address` (text) - Physical address
  - `city` (text) - City
  - `state` (text) - State/Province
  - `country` (text) - Country
  - `postal_code` (text) - Postal code
  - `website` (text) - Company website URL
  - `linkedin_url` (text) - LinkedIn profile URL
  - `logo_url` (text) - Company logo URL
  - `description` (text) - Company description
  - `tags` (text[]) - Array of tags
  - `custom_fields` (jsonb) - Custom field values
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `contacts`
  - `id` (uuid, primary key) - Unique contact identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `company_id` (uuid, foreign key) - Reference to companies
  - `first_name` (text) - Contact first name
  - `last_name` (text) - Contact last name
  - `email` (text) - Primary email address
  - `phone` (text) - Primary phone number
  - `mobile` (text) - Mobile phone number
  - `title` (text) - Job title
  - `department` (text) - Department
  - `avatar_url` (text) - Profile picture URL
  - `linkedin_url` (text) - LinkedIn profile URL
  - `twitter_handle` (text) - Twitter handle
  - `lead_source` (text) - How contact was acquired
  - `lead_status` (text) - Status: new, qualified, unqualified, contacted
  - `lead_score` (integer) - Lead scoring value
  - `tags` (text[]) - Array of tags
  - `custom_fields` (jsonb) - Custom field values
  - `owner_id` (uuid) - Assigned owner user ID
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `pipelines`
  - `id` (uuid, primary key) - Unique pipeline identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Pipeline name
  - `description` (text) - Pipeline description
  - `stages` (jsonb) - Array of pipeline stages with order and probability
  - `is_default` (boolean) - Default pipeline flag
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `deals`
  - `id` (uuid, primary key) - Unique deal identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `pipeline_id` (uuid, foreign key) - Reference to pipelines
  - `contact_id` (uuid, foreign key) - Reference to contacts
  - `company_id` (uuid, foreign key) - Reference to companies
  - `name` (text) - Deal name
  - `value` (numeric) - Deal value/amount
  - `currency` (text) - Currency code
  - `stage` (text) - Current pipeline stage
  - `probability` (integer) - Win probability percentage
  - `expected_close_date` (date) - Expected close date
  - `actual_close_date` (date) - Actual close date
  - `status` (text) - Status: open, won, lost
  - `loss_reason` (text) - Reason if lost
  - `description` (text) - Deal description
  - `tags` (text[]) - Array of tags
  - `custom_fields` (jsonb) - Custom field values
  - `owner_id` (uuid) - Deal owner user ID
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `activities`
  - `id` (uuid, primary key) - Unique activity identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `contact_id` (uuid, foreign key) - Reference to contacts
  - `company_id` (uuid, foreign key) - Reference to companies
  - `deal_id` (uuid, foreign key) - Reference to deals
  - `activity_type` (text) - Type: call, email, meeting, note, task
  - `subject` (text) - Activity subject
  - `description` (text) - Activity description
  - `duration_minutes` (integer) - Activity duration
  - `outcome` (text) - Activity outcome
  - `scheduled_at` (timestamptz) - Scheduled time
  - `completed_at` (timestamptz) - Completion time
  - `is_completed` (boolean) - Completion flag
  - `user_id` (uuid) - User who performed activity
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS on all tables
  - Organization-scoped access policies
  - Members can view and manage CRM data
  - Contact owners have update permissions
  
  ## Important Notes
  1. All tables include organization_id for multi-tenant isolation
  2. Contacts can be linked to companies for B2B relationships
  3. Deals track revenue through customizable pipelines
  4. Activities create comprehensive timeline of interactions
  5. Lead scoring enables automatic qualification
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  domain text,
  industry text,
  size text,
  phone text,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  website text,
  linkedin_url text,
  logo_url text,
  description text,
  tags text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text,
  email text,
  phone text,
  mobile text,
  title text,
  department text,
  avatar_url text,
  linkedin_url text,
  twitter_handle text,
  lead_source text,
  lead_status text DEFAULT 'new',
  lead_score integer DEFAULT 0,
  tags text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  owner_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  stages jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  name text NOT NULL,
  value numeric(15,2),
  currency text DEFAULT 'USD',
  stage text,
  probability integer DEFAULT 0,
  expected_close_date date,
  actual_close_date date,
  status text DEFAULT 'open',
  loss_reason text,
  description text,
  tags text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  owner_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  subject text,
  description text,
  duration_minutes integer,
  outcome text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  is_completed boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_org_id ON pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner_id ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Members can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = companies.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = companies.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = companies.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for contacts
CREATE POLICY "Members can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = contacts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = contacts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = contacts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = contacts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = contacts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for pipelines
CREATE POLICY "Members can view pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = pipelines.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = pipelines.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = pipelines.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for deals
CREATE POLICY "Members can view deals"
  ON deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = deals.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = deals.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = deals.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = deals.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete deals"
  ON deals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = deals.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for activities
CREATE POLICY "Members can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = activities.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = activities.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON companies;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON contacts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON pipelines;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON deals;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON activities;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();