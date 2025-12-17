/*
  # Optimize RLS Policies with Auth Function Subqueries

  ## Performance Optimization
  
  This migration optimizes Row Level Security (RLS) policies by wrapping auth function
  calls in subqueries. This prevents the auth functions from being re-evaluated for each
  row, significantly improving query performance at scale.

  ## Pattern
  
  Before: `auth.uid() = user_id` (evaluated per row)
  After: `(select auth.uid()) = user_id` (evaluated once)

  ## Changes
  
  All RLS policies across the following tables are being optimized:
  
  1. organizations
  2. user_profiles
  3. organization_members
  4. workspaces
  5. projects
  6. task_lists
  7. tasks
  8. task_dependencies
  9. task_comments
  10. task_attachments
  11. time_entries
  12. custom_field_definitions
  13. companies
  14. contacts
  15. pipelines
  16. deals
  17. activities
  18. ai_agents
  19. agent_executions
  20. agent_workflows
  21. mcp_servers
  22. mcp_server_tools
  23. mcp_server_executions
  24. voice_agent_calls
  25. campaigns
  26. automation_workflows
  27. workflow_enrollments
  28. landing_pages
  29. forms
  30. form_submissions
  31. social_media_accounts
  32. social_media_posts
  33. media_library

  ## Impact
  
  This optimization will:
  - Reduce database CPU usage
  - Improve query response times
  - Scale better with larger datasets
  - Maintain identical security behavior
*/

-- Drop and recreate all policies with optimized auth function calls

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
CREATE POLICY "Users can view organizations they are members of"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Organization owners and admins can update" ON public.organizations;
CREATE POLICY "Organization owners and admins can update"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- USER PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON public.user_profiles;
CREATE POLICY "Users can view profiles in their organizations"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT om2.user_id 
      FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
CREATE POLICY "Users can create their own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- ORGANIZATION MEMBERS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;
CREATE POLICY "Members can view organization members"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create organization memberships" ON public.organization_members;
CREATE POLICY "Users can create organization memberships"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners and admins can update memberships" ON public.organization_members;
CREATE POLICY "Owners and admins can update memberships"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners and admins can delete memberships" ON public.organization_members;
CREATE POLICY "Owners and admins can delete memberships"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- WORKSPACES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view organization workspaces" ON public.workspaces;
CREATE POLICY "Members can view organization workspaces"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create workspaces" ON public.workspaces;
CREATE POLICY "Members can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update workspaces" ON public.workspaces;
CREATE POLICY "Members can update workspaces"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners and admins can delete workspaces" ON public.workspaces;
CREATE POLICY "Owners and admins can delete workspaces"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PROJECTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view organization projects" ON public.projects;
CREATE POLICY "Members can view organization projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create projects" ON public.projects;
CREATE POLICY "Members can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update projects" ON public.projects;
CREATE POLICY "Members can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Owners and admins can delete projects" ON public.projects;
CREATE POLICY "Owners and admins can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- TASK LISTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view task lists" ON public.task_lists;
CREATE POLICY "Members can view task lists"
  ON public.task_lists FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage task lists" ON public.task_lists;
CREATE POLICY "Members can manage task lists"
  ON public.task_lists FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TASKS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create tasks" ON public.tasks;
CREATE POLICY "Members can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
CREATE POLICY "Members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can delete tasks" ON public.tasks;
CREATE POLICY "Members can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TASK DEPENDENCIES
-- ============================================================================

DROP POLICY IF EXISTS "Members can manage task dependencies" ON public.task_dependencies;
CREATE POLICY "Members can manage task dependencies"
  ON public.task_dependencies FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TASK COMMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view comments" ON public.task_comments;
CREATE POLICY "Members can view comments"
  ON public.task_comments FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create comments" ON public.task_comments;
CREATE POLICY "Members can create comments"
  ON public.task_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own comments" ON public.task_comments;
CREATE POLICY "Users can update own comments"
  ON public.task_comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own comments" ON public.task_comments;
CREATE POLICY "Users can delete own comments"
  ON public.task_comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TASK ATTACHMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view attachments" ON public.task_attachments;
CREATE POLICY "Members can view attachments"
  ON public.task_attachments FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create attachments" ON public.task_attachments;
CREATE POLICY "Members can create attachments"
  ON public.task_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own attachments" ON public.task_attachments;
CREATE POLICY "Users can delete own attachments"
  ON public.task_attachments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TIME ENTRIES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view time entries" ON public.time_entries;
CREATE POLICY "Members can view time entries"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can manage own time entries" ON public.time_entries;
CREATE POLICY "Users can manage own time entries"
  ON public.time_entries FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- CUSTOM FIELD DEFINITIONS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view custom field definitions" ON public.custom_field_definitions;
CREATE POLICY "Members can view custom field definitions"
  ON public.custom_field_definitions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage custom field definitions" ON public.custom_field_definitions;
CREATE POLICY "Admins can manage custom field definitions"
  ON public.custom_field_definitions FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- COMPANIES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view companies" ON public.companies;
CREATE POLICY "Members can view companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage companies" ON public.companies;
CREATE POLICY "Members can manage companies"
  ON public.companies FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- CONTACTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view contacts" ON public.contacts;
CREATE POLICY "Members can view contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create contacts" ON public.contacts;
CREATE POLICY "Members can create contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update contacts" ON public.contacts;
CREATE POLICY "Members can update contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can delete contacts" ON public.contacts;
CREATE POLICY "Members can delete contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PIPELINES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view pipelines" ON public.pipelines;
CREATE POLICY "Members can view pipelines"
  ON public.pipelines FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage pipelines" ON public.pipelines;
CREATE POLICY "Admins can manage pipelines"
  ON public.pipelines FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- DEALS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view deals" ON public.deals;
CREATE POLICY "Members can view deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create deals" ON public.deals;
CREATE POLICY "Members can create deals"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can update deals" ON public.deals;
CREATE POLICY "Members can update deals"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can delete deals" ON public.deals;
CREATE POLICY "Members can delete deals"
  ON public.deals FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- ACTIVITIES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view activities" ON public.activities;
CREATE POLICY "Members can view activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can create activities" ON public.activities;
CREATE POLICY "Members can create activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;
CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- AI AGENTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view agents" ON public.ai_agents;
CREATE POLICY "Members can view agents"
  ON public.ai_agents FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage agents" ON public.ai_agents;
CREATE POLICY "Admins can manage agents"
  ON public.ai_agents FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- AGENT EXECUTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view agent executions" ON public.agent_executions;
CREATE POLICY "Members can view agent executions"
  ON public.agent_executions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create agent executions" ON public.agent_executions;
CREATE POLICY "System can create agent executions"
  ON public.agent_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- AGENT WORKFLOWS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view workflows" ON public.agent_workflows;
CREATE POLICY "Members can view workflows"
  ON public.agent_workflows FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage workflows" ON public.agent_workflows;
CREATE POLICY "Admins can manage workflows"
  ON public.agent_workflows FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- MCP SERVERS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view MCP servers" ON public.mcp_servers;
CREATE POLICY "Members can view MCP servers"
  ON public.mcp_servers FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage MCP servers" ON public.mcp_servers;
CREATE POLICY "Admins can manage MCP servers"
  ON public.mcp_servers FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- MCP SERVER TOOLS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view MCP server tools" ON public.mcp_server_tools;
CREATE POLICY "Members can view MCP server tools"
  ON public.mcp_server_tools FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage MCP server tools" ON public.mcp_server_tools;
CREATE POLICY "System can manage MCP server tools"
  ON public.mcp_server_tools FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- MCP SERVER EXECUTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view MCP executions" ON public.mcp_server_executions;
CREATE POLICY "Members can view MCP executions"
  ON public.mcp_server_executions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create MCP executions" ON public.mcp_server_executions;
CREATE POLICY "System can create MCP executions"
  ON public.mcp_server_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- VOICE AGENT CALLS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view voice calls" ON public.voice_agent_calls;
CREATE POLICY "Members can view voice calls"
  ON public.voice_agent_calls FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage voice calls" ON public.voice_agent_calls;
CREATE POLICY "System can manage voice calls"
  ON public.voice_agent_calls FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view campaigns" ON public.campaigns;
CREATE POLICY "Members can view campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage campaigns" ON public.campaigns;
CREATE POLICY "Members can manage campaigns"
  ON public.campaigns FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- AUTOMATION WORKFLOWS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view automation workflows" ON public.automation_workflows;
CREATE POLICY "Members can view automation workflows"
  ON public.automation_workflows FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage automation workflows" ON public.automation_workflows;
CREATE POLICY "Members can manage automation workflows"
  ON public.automation_workflows FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- WORKFLOW ENROLLMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view workflow enrollments" ON public.workflow_enrollments;
CREATE POLICY "Members can view workflow enrollments"
  ON public.workflow_enrollments FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage workflow enrollments" ON public.workflow_enrollments;
CREATE POLICY "System can manage workflow enrollments"
  ON public.workflow_enrollments FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- LANDING PAGES
-- ============================================================================

DROP POLICY IF EXISTS "Members can view landing pages" ON public.landing_pages;
CREATE POLICY "Members can view landing pages"
  ON public.landing_pages FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage landing pages" ON public.landing_pages;
CREATE POLICY "Members can manage landing pages"
  ON public.landing_pages FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- FORMS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view forms" ON public.forms;
CREATE POLICY "Members can view forms"
  ON public.forms FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage forms" ON public.forms;
CREATE POLICY "Members can manage forms"
  ON public.forms FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- FORM SUBMISSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view form submissions" ON public.form_submissions;
CREATE POLICY "Members can view form submissions"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- SOCIAL MEDIA ACCOUNTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view social media accounts" ON public.social_media_accounts;
CREATE POLICY "Members can view social media accounts"
  ON public.social_media_accounts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage social media accounts" ON public.social_media_accounts;
CREATE POLICY "Admins can manage social media accounts"
  ON public.social_media_accounts FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- SOCIAL MEDIA POSTS
-- ============================================================================

DROP POLICY IF EXISTS "Members can view social media posts" ON public.social_media_posts;
CREATE POLICY "Members can view social media posts"
  ON public.social_media_posts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage social media posts" ON public.social_media_posts;
CREATE POLICY "Members can manage social media posts"
  ON public.social_media_posts FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- MEDIA LIBRARY
-- ============================================================================

DROP POLICY IF EXISTS "Members can view media library" ON public.media_library;
CREATE POLICY "Members can view media library"
  ON public.media_library FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can manage media library" ON public.media_library;
CREATE POLICY "Members can manage media library"
  ON public.media_library FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_members 
      WHERE user_id = (select auth.uid())
    )
  );
