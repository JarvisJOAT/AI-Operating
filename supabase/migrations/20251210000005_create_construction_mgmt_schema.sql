-- ============================================================
-- Construction Management App Database Schema
-- Supports: Projects, Tasks, Members, Receipts, Expenses,
--           Messages with Translation, Documents with Versioning
-- ============================================================

-- ============================================================
-- CONSTRUCTION PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning', -- planning, in_progress, on_hold, completed
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  client_name TEXT,
  client_contact TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE construction_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their construction projects." ON construction_projects
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = construction_projects.organization_id));

CREATE INDEX idx_construction_projects_org ON construction_projects(organization_id);
CREATE INDEX idx_construction_projects_status ON construction_projects(status);

-- ============================================================
-- PROJECT MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, manager, member, viewer
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view their project membership." ON project_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM project_members pm WHERE pm.project_id = project_members.project_id
  ));

CREATE POLICY "Project managers can manage members." ON project_members
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM project_members 
    WHERE project_id = project_members.project_id 
    AND role IN ('owner', 'manager')
  ));

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- ============================================================
-- PROJECT TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, review, completed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assignee_id UUID REFERENCES auth.users(id),
  due_date DATE,
  estimated_hours DECIMAL(6, 2),
  actual_hours DECIMAL(6, 2),
  parent_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  order_index INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can manage tasks." ON project_tasks
  FOR ALL USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);

-- ============================================================
-- RECEIPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image/jpeg, image/png, application/pdf
  file_size INT,
  vendor_name TEXT,
  amount DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  receipt_date DATE,
  notes TEXT,
  ocr_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  ocr_result JSONB,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can manage receipts." ON receipts
  FOR ALL USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_receipts_project ON receipts(project_id);
CREATE INDEX idx_receipts_ocr_status ON receipts(ocr_status);

-- ============================================================
-- EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- materials, labor, equipment, tools, permits, etc.
  expense_date DATE NOT NULL,
  vendor_name TEXT,
  payment_method TEXT, -- cash, card, check, transfer
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can manage expenses." ON expenses
  FOR ALL USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- ============================================================
-- PROJECT MESSAGES TABLE (with translation support)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  original_language TEXT DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb, -- { "es": "...", "pt": "..." }
  reply_to UUID REFERENCES project_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view and send messages." ON project_messages
  FOR ALL USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_project_messages_project ON project_messages(project_id);
CREATE INDEX idx_project_messages_sender ON project_messages(sender_id);
CREATE INDEX idx_project_messages_created ON project_messages(created_at);

-- ============================================================
-- TRANSLATION CACHE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text_hash TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_text_hash, source_language, target_language)
);

CREATE INDEX idx_translation_cache_lookup ON translation_cache(source_text_hash, source_language, target_language);

-- ============================================================
-- PROJECT DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL, -- pdf, dwg, xlsx, docx, etc.
  current_version INT DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can manage documents." ON project_documents
  FOR ALL USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE INDEX idx_project_documents_project ON project_documents(project_id);

-- ============================================================
-- DOCUMENT VERSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES project_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  changes_summary TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view document versions." ON document_versions
  FOR ALL USING (document_id IN (
    SELECT id FROM project_documents WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  ));

CREATE INDEX idx_document_versions_doc ON document_versions(document_id);

-- ============================================================
-- TRIGGERS for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_construction_projects_updated_at
  BEFORE UPDATE ON construction_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON project_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

