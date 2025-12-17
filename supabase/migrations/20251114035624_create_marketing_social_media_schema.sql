/*
  # Marketing Automation and Social Media Management Schema
  
  ## Overview
  This migration creates tables for marketing campaigns, email/SMS automation, landing pages,
  social media management, and content scheduling.
  
  ## New Tables
  
  ### `campaigns`
  - `id` (uuid, primary key) - Unique campaign identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Campaign name
  - `description` (text) - Campaign description
  - `campaign_type` (text) - Type: email, sms, workflow, landing_page
  - `status` (text) - Status: draft, scheduled, active, paused, completed
  - `target_audience` (jsonb) - Audience segmentation criteria
  - `content` (jsonb) - Campaign content and templates
  - `settings` (jsonb) - Campaign settings and configuration
  - `scheduled_at` (timestamptz) - Scheduled launch time
  - `started_at` (timestamptz) - Actual start time
  - `ended_at` (timestamptz) - Campaign end time
  - `metrics` (jsonb) - Campaign metrics: sent, opened, clicked, converted
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `automation_workflows`
  - `id` (uuid, primary key) - Unique workflow identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Workflow name
  - `description` (text) - Workflow description
  - `workflow_definition` (jsonb) - Visual workflow nodes and connections
  - `trigger_type` (text) - Type: form_submit, tag_added, date, webhook
  - `trigger_config` (jsonb) - Trigger configuration
  - `is_active` (boolean) - Active status
  - `total_enrolled` (integer) - Total contacts enrolled
  - `total_completed` (integer) - Total contacts completed
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `workflow_enrollments`
  - `id` (uuid, primary key) - Unique enrollment identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `workflow_id` (uuid, foreign key) - Reference to automation_workflows
  - `contact_id` (uuid, foreign key) - Reference to contacts
  - `status` (text) - Status: active, completed, exited
  - `current_step` (text) - Current workflow step ID
  - `enrolled_at` (timestamptz) - Enrollment timestamp
  - `completed_at` (timestamptz) - Completion timestamp
  - `data` (jsonb) - Enrollment-specific data
  
  ### `landing_pages`
  - `id` (uuid, primary key) - Unique page identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Page name
  - `slug` (text) - URL slug
  - `title` (text) - Page title
  - `description` (text) - Page meta description
  - `content` (jsonb) - Page content structure
  - `settings` (jsonb) - Page settings: SEO, tracking, forms
  - `status` (text) - Status: draft, published, archived
  - `published_at` (timestamptz) - Publish timestamp
  - `visits` (integer) - Total visits
  - `conversions` (integer) - Total conversions
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `forms`
  - `id` (uuid, primary key) - Unique form identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Form name
  - `description` (text) - Form description
  - `fields` (jsonb) - Form field definitions
  - `settings` (jsonb) - Form settings: notifications, redirects
  - `is_active` (boolean) - Active status
  - `total_submissions` (integer) - Total submissions
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `form_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `form_id` (uuid, foreign key) - Reference to forms
  - `contact_id` (uuid, foreign key) - Reference to contacts (if matched)
  - `data` (jsonb) - Submission data
  - `ip_address` (text) - Submitter IP
  - `user_agent` (text) - Submitter browser info
  - `referrer` (text) - Referrer URL
  - `created_at` (timestamptz) - Submission timestamp
  
  ### `social_media_accounts`
  - `id` (uuid, primary key) - Unique account identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `platform` (text) - Platform: facebook, instagram, twitter, linkedin, tiktok
  - `account_name` (text) - Account username/handle
  - `account_id` (text) - Platform account ID
  - `access_token` (text) - OAuth access token (encrypted)
  - `refresh_token` (text) - OAuth refresh token (encrypted)
  - `token_expires_at` (timestamptz) - Token expiration
  - `is_active` (boolean) - Active status
  - `metadata` (jsonb) - Platform-specific metadata
  - `connected_by` (uuid) - User who connected account
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `social_media_posts`
  - `id` (uuid, primary key) - Unique post identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `account_ids` (uuid[]) - Array of account IDs to post to
  - `content` (text) - Post content
  - `media_urls` (text[]) - Array of media URLs
  - `status` (text) - Status: draft, scheduled, published, failed
  - `scheduled_at` (timestamptz) - Scheduled publish time
  - `published_at` (timestamptz) - Actual publish time
  - `platform_post_ids` (jsonb) - Platform-specific post IDs
  - `metrics` (jsonb) - Post metrics: likes, comments, shares, reach
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `media_library`
  - `id` (uuid, primary key) - Unique media identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `file_name` (text) - File name
  - `file_url` (text) - Storage URL
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type
  - `media_type` (text) - Type: image, video, document
  - `tags` (text[]) - Array of tags
  - `uploaded_by` (uuid) - Uploader user ID
  - `created_at` (timestamptz) - Upload timestamp
  
  ## Security
  - Enable RLS on all tables
  - Organization-scoped access policies
  - Members can view and create content
  - Admins can manage sensitive settings
  
  ## Important Notes
  1. All tables include organization_id for multi-tenant isolation
  2. Automation workflows support visual builder with nodes
  3. Landing pages track conversion metrics
  4. Social media accounts store encrypted tokens
  5. Media library centralizes asset management
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  campaign_type text NOT NULL,
  status text DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}'::jsonb,
  content jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create automation_workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  workflow_definition jsonb DEFAULT '[]'::jsonb,
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  total_enrolled integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow_enrollments table
CREATE TABLE IF NOT EXISTS workflow_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workflow_id uuid REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active',
  current_step text,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  data jsonb DEFAULT '{}'::jsonb
);

-- Create landing_pages table
CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  title text,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft',
  published_at timestamptz,
  visits integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  fields jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  total_submissions integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  data jsonb NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create social_media_accounts table
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  account_name text NOT NULL,
  account_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  connected_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create social_media_posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_ids uuid[],
  content text NOT NULL,
  media_urls text[],
  status text DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  platform_post_ids jsonb DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  media_type text,
  tags text[],
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_workflow_id ON workflow_enrollments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_contact_id ON workflow_enrollments(contact_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_org_id ON landing_pages(organization_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_forms_org_id ON forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_org_id ON social_media_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_org_id ON social_media_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_account_ids ON social_media_posts USING gin(account_ids);
CREATE INDEX IF NOT EXISTS idx_media_library_org_id ON media_library(organization_id);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Members can view campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = campaigns.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = campaigns.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = campaigns.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for automation_workflows
CREATE POLICY "Members can view automation workflows"
  ON automation_workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = automation_workflows.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage automation workflows"
  ON automation_workflows FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = automation_workflows.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = automation_workflows.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for workflow_enrollments
CREATE POLICY "Members can view workflow enrollments"
  ON workflow_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = workflow_enrollments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage workflow enrollments"
  ON workflow_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = workflow_enrollments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = workflow_enrollments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for landing_pages
CREATE POLICY "Members can view landing pages"
  ON landing_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = landing_pages.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage landing pages"
  ON landing_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = landing_pages.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = landing_pages.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for forms
CREATE POLICY "Members can view forms"
  ON forms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = forms.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage forms"
  ON forms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = forms.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = forms.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for form_submissions
CREATE POLICY "Members can view form submissions"
  ON form_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = form_submissions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create form submissions"
  ON form_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for social_media_accounts
CREATE POLICY "Members can view social media accounts"
  ON social_media_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_accounts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage social media accounts"
  ON social_media_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_accounts.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_accounts.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for social_media_posts
CREATE POLICY "Members can view social media posts"
  ON social_media_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_posts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage social media posts"
  ON social_media_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_posts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = social_media_posts.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for media_library
CREATE POLICY "Members can view media library"
  ON media_library FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = media_library.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage media library"
  ON media_library FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = media_library.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = media_library.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON campaigns;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON automation_workflows;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON landing_pages;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON forms;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON social_media_accounts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON social_media_posts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON social_media_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();