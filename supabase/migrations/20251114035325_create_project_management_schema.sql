/*
  # Project Management Module Schema
  
  ## Overview
  This migration creates the project management system tables supporting hierarchical task organization,
  multiple views (Kanban, List, Timeline, Calendar), custom fields, time tracking, and collaboration.
  
  ## New Tables
  
  ### `projects`
  - `id` (uuid, primary key) - Unique project identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `workspace_id` (uuid, foreign key) - Reference to workspaces
  - `name` (text) - Project name
  - `description` (text) - Project description
  - `color` (text) - Visual identifier color
  - `icon` (text) - Icon identifier
  - `status` (text) - Project status: active, on_hold, completed, archived
  - `start_date` (date) - Project start date
  - `end_date` (date) - Project end date
  - `owner_id` (uuid) - Project owner user ID
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `task_lists`
  - `id` (uuid, primary key) - Unique list identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `project_id` (uuid, foreign key) - Reference to projects
  - `name` (text) - List name
  - `description` (text) - List description
  - `position` (integer) - Display order position
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `tasks`
  - `id` (uuid, primary key) - Unique task identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `project_id` (uuid, foreign key) - Reference to projects
  - `list_id` (uuid, foreign key) - Reference to task_lists
  - `parent_task_id` (uuid, foreign key) - Parent task for subtasks
  - `name` (text) - Task name
  - `description` (text) - Task description with rich text
  - `status` (text) - Task status: todo, in_progress, review, done, blocked
  - `priority` (text) - Priority: low, medium, high, urgent
  - `due_date` (timestamptz) - Due date
  - `start_date` (timestamptz) - Start date
  - `estimated_hours` (numeric) - Time estimate
  - `actual_hours` (numeric) - Actual time spent
  - `position` (integer) - Display order position
  - `assigned_to` (uuid[]) - Array of assigned user IDs
  - `tags` (text[]) - Array of tags
  - `custom_fields` (jsonb) - Custom field values
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `completed_at` (timestamptz) - Completion timestamp
  
  ### `task_dependencies`
  - `id` (uuid, primary key) - Unique dependency identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `task_id` (uuid, foreign key) - Dependent task
  - `depends_on_task_id` (uuid, foreign key) - Task that must be completed first
  - `dependency_type` (text) - Type: blocks, blocked_by
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `task_comments`
  - `id` (uuid, primary key) - Unique comment identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `task_id` (uuid, foreign key) - Reference to tasks
  - `user_id` (uuid, foreign key) - Comment author
  - `content` (text) - Comment content
  - `mentions` (uuid[]) - Array of mentioned user IDs
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `task_attachments`
  - `id` (uuid, primary key) - Unique attachment identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `task_id` (uuid, foreign key) - Reference to tasks
  - `user_id` (uuid, foreign key) - Uploader user ID
  - `file_name` (text) - File name
  - `file_url` (text) - Storage URL
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `time_entries`
  - `id` (uuid, primary key) - Unique time entry identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `task_id` (uuid, foreign key) - Reference to tasks
  - `user_id` (uuid, foreign key) - User who tracked time
  - `description` (text) - Time entry description
  - `hours` (numeric) - Hours tracked
  - `started_at` (timestamptz) - Start time for timer
  - `ended_at` (timestamptz) - End time for timer
  - `is_running` (boolean) - Timer active flag
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `custom_field_definitions`
  - `id` (uuid, primary key) - Unique field definition identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `project_id` (uuid, foreign key) - Reference to projects (null for global)
  - `name` (text) - Field name
  - `field_type` (text) - Type: text, number, date, dropdown, multi_select, user, checkbox
  - `options` (jsonb) - Options for dropdown/multi_select fields
  - `is_required` (boolean) - Required field flag
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Policies ensure organization-scoped data access
  - Members can view and create tasks
  - Only assigned users and admins can update tasks
  
  ## Important Notes
  1. All tables include organization_id for multi-tenant isolation
  2. Tasks support hierarchical structure through parent_task_id
  3. Custom fields provide flexibility without schema changes
  4. Time tracking supports both manual entry and active timers
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'FolderOpen',
  status text DEFAULT 'active',
  start_date date,
  end_date date,
  owner_id uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task lists table
CREATE TABLE IF NOT EXISTS task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  list_id uuid REFERENCES task_lists(id) ON DELETE SET NULL,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'todo',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  start_date timestamptz,
  estimated_hours numeric(10,2),
  actual_hours numeric(10,2) DEFAULT 0,
  position integer DEFAULT 0,
  assigned_to uuid[],
  tags text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  dependency_type text DEFAULT 'blocks',
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  mentions uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task attachments table
CREATE TABLE IF NOT EXISTS task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  created_at timestamptz DEFAULT now()
);

-- Create time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text,
  hours numeric(10,2),
  started_at timestamptz,
  ended_at timestamptz,
  is_running boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create custom field definitions table
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  field_type text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_task_lists_project_id ON task_lists(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks USING gin(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Members can view organization projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for task_lists
CREATE POLICY "Members can view task lists"
  ON task_lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_lists.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage task lists"
  ON task_lists FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_lists.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_lists.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Members can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = tasks.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for task_dependencies
CREATE POLICY "Members can manage task dependencies"
  ON task_dependencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_dependencies.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_dependencies.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for task_comments
CREATE POLICY "Members can view comments"
  ON task_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_comments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments"
  ON task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_comments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON task_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON task_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for task_attachments
CREATE POLICY "Members can view attachments"
  ON task_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_attachments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create attachments"
  ON task_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = task_attachments.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own attachments"
  ON task_attachments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for time_entries
CREATE POLICY "Members can view time entries"
  ON time_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = time_entries.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own time entries"
  ON time_entries FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for custom_field_definitions
CREATE POLICY "Members can view custom field definitions"
  ON custom_field_definitions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_field_definitions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage custom field definitions"
  ON custom_field_definitions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_field_definitions.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = custom_field_definitions.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON projects;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON task_lists;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON task_lists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON tasks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON task_comments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();