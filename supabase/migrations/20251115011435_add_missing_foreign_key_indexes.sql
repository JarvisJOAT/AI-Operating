/*
  # Add Missing Foreign Key Indexes

  ## Performance Optimization
  
  This migration adds indexes to all foreign key columns that were missing them.
  These indexes significantly improve query performance for JOIN operations and
  foreign key constraint checks.

  ## Changes
  
  ### Indexes Added
  
  1. **activities table**
     - Index on company_id for faster company-activity lookups
  
  2. **agent_workflows table**
     - Index on created_by for faster user-workflow lookups
  
  3. **ai_agents table**
     - Index on created_by for faster user-agent lookups
  
  4. **automation_workflows table**
     - Index on created_by for faster user-workflow lookups
  
  5. **campaigns table**
     - Index on created_by for faster user-campaign lookups
  
  6. **companies table**
     - Index on created_by for faster user-company lookups
  
  7. **contacts table**
     - Index on created_by for faster user-contact lookups
  
  8. **custom_field_definitions table**
     - Index on organization_id for faster org-field lookups
     - Index on project_id for faster project-field lookups
  
  9. **deals table**
     - Index on created_by for faster user-deal lookups
  
  10. **form_submissions table**
      - Index on contact_id for faster contact-submission lookups
      - Index on organization_id for faster org-submission lookups
  
  11. **forms table**
      - Index on created_by for faster user-form lookups
  
  12. **landing_pages table**
      - Index on created_by for faster user-page lookups
  
  13. **mcp_server_executions table**
      - Index on executed_by for faster user-execution lookups
      - Index on organization_id for faster org-execution lookups
  
  14. **mcp_server_tools table**
      - Index on organization_id for faster org-tool lookups
  
  15. **mcp_servers table**
      - Index on created_by for faster user-server lookups
  
  16. **media_library table**
      - Index on uploaded_by for faster user-media lookups
  
  17. **organization_members table**
      - Index on invited_by for faster invite tracking
  
  18. **projects table**
      - Index on created_by for faster user-project lookups
      - Index on owner_id for faster owner-project lookups
  
  19. **social_media_accounts table**
      - Index on connected_by for faster user-account lookups
  
  20. **social_media_posts table**
      - Index on created_by for faster user-post lookups
  
  21. **task_attachments table**
      - Index on organization_id for faster org-attachment lookups
      - Index on user_id for faster user-attachment lookups
  
  22. **task_comments table**
      - Index on organization_id for faster org-comment lookups
      - Index on user_id for faster user-comment lookups
  
  23. **task_dependencies table**
      - Index on depends_on_task_id for faster dependency lookups
      - Index on organization_id for faster org-dependency lookups
  
  24. **task_lists table**
      - Index on organization_id for faster org-list lookups
  
  25. **tasks table**
      - Index on created_by for faster user-task lookups
      - Index on organization_id for faster org-task lookups
  
  26. **time_entries table**
      - Index on organization_id for faster org-time lookups
  
  27. **workflow_enrollments table**
      - Index on organization_id for faster org-enrollment lookups
  
  28. **workspaces table**
      - Index on created_by for faster user-workspace lookups

  ## Impact
  
  These indexes will significantly improve query performance for:
  - JOIN operations across related tables
  - Foreign key constraint validation
  - Filtered queries on foreign key columns
  - Aggregations grouped by foreign keys
*/

-- activities
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);

-- agent_workflows
CREATE INDEX IF NOT EXISTS idx_agent_workflows_created_by ON public.agent_workflows(created_by);

-- ai_agents
CREATE INDEX IF NOT EXISTS idx_ai_agents_created_by ON public.ai_agents(created_by);

-- automation_workflows
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created_by ON public.automation_workflows(created_by);

-- campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);

-- companies
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON public.contacts(created_by);

-- custom_field_definitions
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_organization_id ON public.custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_project_id ON public.custom_field_definitions(project_id);

-- deals
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON public.deals(created_by);

-- form_submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_id ON public.form_submissions(contact_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_organization_id ON public.form_submissions(organization_id);

-- forms
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON public.forms(created_by);

-- landing_pages
CREATE INDEX IF NOT EXISTS idx_landing_pages_created_by ON public.landing_pages(created_by);

-- mcp_server_executions
CREATE INDEX IF NOT EXISTS idx_mcp_server_executions_executed_by ON public.mcp_server_executions(executed_by);
CREATE INDEX IF NOT EXISTS idx_mcp_server_executions_organization_id ON public.mcp_server_executions(organization_id);

-- mcp_server_tools
CREATE INDEX IF NOT EXISTS idx_mcp_server_tools_organization_id ON public.mcp_server_tools(organization_id);

-- mcp_servers
CREATE INDEX IF NOT EXISTS idx_mcp_servers_created_by ON public.mcp_servers(created_by);

-- media_library
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON public.media_library(uploaded_by);

-- organization_members
CREATE INDEX IF NOT EXISTS idx_organization_members_invited_by ON public.organization_members(invited_by);

-- projects
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- social_media_accounts
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_connected_by ON public.social_media_accounts(connected_by);

-- social_media_posts
CREATE INDEX IF NOT EXISTS idx_social_media_posts_created_by ON public.social_media_posts(created_by);

-- task_attachments
CREATE INDEX IF NOT EXISTS idx_task_attachments_organization_id ON public.task_attachments(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_user_id ON public.task_attachments(user_id);

-- task_comments
CREATE INDEX IF NOT EXISTS idx_task_comments_organization_id ON public.task_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON public.task_comments(user_id);

-- task_dependencies
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on_task_id ON public.task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_organization_id ON public.task_dependencies(organization_id);

-- task_lists
CREATE INDEX IF NOT EXISTS idx_task_lists_organization_id ON public.task_lists(organization_id);

-- tasks
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);

-- time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_organization_id ON public.time_entries(organization_id);

-- workflow_enrollments
CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_organization_id ON public.workflow_enrollments(organization_id);

-- workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON public.workspaces(created_by);
