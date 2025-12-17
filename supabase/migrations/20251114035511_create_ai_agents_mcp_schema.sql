/*
  # AI Agents and MCP Server Management Schema
  
  ## Overview
  This migration creates tables for managing AI agents (content generation, voice, operating, social media)
  and MCP server integration (creation, monitoring, tool discovery).
  
  ## New Tables
  
  ### `ai_agents`
  - `id` (uuid, primary key) - Unique agent identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Agent name
  - `description` (text) - Agent description
  - `agent_type` (text) - Type: content_generation, voice, operating, social_media, lead_qualification
  - `status` (text) - Status: active, paused, archived
  - `configuration` (jsonb) - Agent configuration including prompts, parameters, tools
  - `knowledge_base` (jsonb) - Company/project specific knowledge
  - `performance_metrics` (jsonb) - Metrics: tokens used, tasks completed, success rate
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `agent_executions`
  - `id` (uuid, primary key) - Unique execution identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `agent_id` (uuid, foreign key) - Reference to ai_agents
  - `execution_type` (text) - Type: manual, scheduled, triggered
  - `input_data` (jsonb) - Execution input
  - `output_data` (jsonb) - Execution output
  - `status` (text) - Status: pending, running, completed, failed
  - `error_message` (text) - Error details if failed
  - `started_at` (timestamptz) - Execution start time
  - `completed_at` (timestamptz) - Execution completion time
  - `duration_ms` (integer) - Duration in milliseconds
  - `tokens_used` (integer) - Tokens consumed
  - `cost` (numeric) - Execution cost
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `agent_workflows`
  - `id` (uuid, primary key) - Unique workflow identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Workflow name
  - `description` (text) - Workflow description
  - `workflow_definition` (jsonb) - Workflow steps and agent chain configuration
  - `trigger_type` (text) - Type: manual, schedule, event, webhook
  - `trigger_config` (jsonb) - Trigger configuration
  - `is_active` (boolean) - Active status
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `mcp_servers`
  - `id` (uuid, primary key) - Unique server identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `name` (text) - Server name
  - `description` (text) - Server description
  - `server_type` (text) - Type: hosted, external, custom
  - `endpoint_url` (text) - Server endpoint URL
  - `authentication` (jsonb) - Authentication configuration (encrypted)
  - `capabilities` (jsonb) - Server capabilities: resources, tools, prompts
  - `status` (text) - Status: active, inactive, error
  - `health_status` (text) - Health: healthy, degraded, down
  - `last_health_check` (timestamptz) - Last health check timestamp
  - `version` (text) - Server version
  - `metadata` (jsonb) - Additional server metadata
  - `created_by` (uuid) - Creator user ID
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `mcp_server_tools`
  - `id` (uuid, primary key) - Unique tool identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `server_id` (uuid, foreign key) - Reference to mcp_servers
  - `tool_name` (text) - Tool name
  - `tool_description` (text) - Tool description
  - `input_schema` (jsonb) - Tool input schema
  - `output_schema` (jsonb) - Tool output schema
  - `examples` (jsonb) - Usage examples
  - `is_enabled` (boolean) - Enabled status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `mcp_server_executions`
  - `id` (uuid, primary key) - Unique execution identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `server_id` (uuid, foreign key) - Reference to mcp_servers
  - `tool_name` (text) - Tool executed
  - `input_params` (jsonb) - Input parameters
  - `output_result` (jsonb) - Output result
  - `status` (text) - Status: success, error
  - `error_message` (text) - Error details if failed
  - `duration_ms` (integer) - Duration in milliseconds
  - `executed_by` (uuid) - User who triggered execution
  - `created_at` (timestamptz) - Execution timestamp
  
  ### `voice_agent_calls`
  - `id` (uuid, primary key) - Unique call identifier
  - `organization_id` (uuid, foreign key) - Reference to organizations
  - `agent_id` (uuid, foreign key) - Reference to ai_agents
  - `contact_id` (uuid, foreign key) - Reference to contacts
  - `phone_number` (text) - Phone number called
  - `direction` (text) - Direction: inbound, outbound
  - `status` (text) - Status: queued, ringing, in_progress, completed, failed
  - `duration_seconds` (integer) - Call duration
  - `recording_url` (text) - Call recording URL
  - `transcription` (text) - Call transcription
  - `sentiment_analysis` (jsonb) - Sentiment analysis results
  - `outcome` (text) - Call outcome
  - `metadata` (jsonb) - Additional call metadata
  - `started_at` (timestamptz) - Call start time
  - `ended_at` (timestamptz) - Call end time
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Organization-scoped access policies
  - Only admins can create and configure agents and MCP servers
  - All members can view agents and executions
  
  ## Important Notes
  1. AI agents support multiple types for different use cases
  2. Agent workflows enable chaining multiple agents
  3. MCP servers can be hosted, external, or custom-built
  4. Tool discovery automatically catalogs server capabilities
  5. Voice agent calls are tracked with full transcription and analytics
*/

-- Create ai_agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  agent_type text NOT NULL,
  status text DEFAULT 'active',
  configuration jsonb DEFAULT '{}'::jsonb,
  knowledge_base jsonb DEFAULT '{}'::jsonb,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE NOT NULL,
  execution_type text DEFAULT 'manual',
  input_data jsonb,
  output_data jsonb,
  status text DEFAULT 'pending',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  tokens_used integer,
  cost numeric(10,4),
  created_at timestamptz DEFAULT now()
);

-- Create agent_workflows table
CREATE TABLE IF NOT EXISTS agent_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  workflow_definition jsonb DEFAULT '[]'::jsonb,
  trigger_type text DEFAULT 'manual',
  trigger_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mcp_servers table
CREATE TABLE IF NOT EXISTS mcp_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  server_type text NOT NULL,
  endpoint_url text,
  authentication jsonb DEFAULT '{}'::jsonb,
  capabilities jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  health_status text DEFAULT 'healthy',
  last_health_check timestamptz,
  version text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mcp_server_tools table
CREATE TABLE IF NOT EXISTS mcp_server_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  server_id uuid REFERENCES mcp_servers(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  tool_description text,
  input_schema jsonb DEFAULT '{}'::jsonb,
  output_schema jsonb DEFAULT '{}'::jsonb,
  examples jsonb DEFAULT '[]'::jsonb,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mcp_server_executions table
CREATE TABLE IF NOT EXISTS mcp_server_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  server_id uuid REFERENCES mcp_servers(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  input_params jsonb,
  output_result jsonb,
  status text DEFAULT 'success',
  error_message text,
  duration_ms integer,
  executed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create voice_agent_calls table
CREATE TABLE IF NOT EXISTS voice_agent_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  phone_number text NOT NULL,
  direction text NOT NULL,
  status text DEFAULT 'queued',
  duration_seconds integer,
  recording_url text,
  transcription text,
  sentiment_analysis jsonb,
  outcome text,
  metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_agents_org_id ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_executions_org_id ON agent_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_org_id ON agent_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_org_id ON mcp_servers(organization_id);
CREATE INDEX IF NOT EXISTS idx_mcp_server_tools_server_id ON mcp_server_tools(server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_server_executions_server_id ON mcp_server_executions(server_id);
CREATE INDEX IF NOT EXISTS idx_voice_agent_calls_org_id ON voice_agent_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_voice_agent_calls_agent_id ON voice_agent_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_voice_agent_calls_contact_id ON voice_agent_calls(contact_id);

-- Enable RLS
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_server_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_server_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agent_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_agents
CREATE POLICY "Members can view agents"
  ON ai_agents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agents.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage agents"
  ON ai_agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agents.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = ai_agents.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for agent_executions
CREATE POLICY "Members can view agent executions"
  ON agent_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = agent_executions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create agent executions"
  ON agent_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = agent_executions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for agent_workflows
CREATE POLICY "Members can view workflows"
  ON agent_workflows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = agent_workflows.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workflows"
  ON agent_workflows FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = agent_workflows.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = agent_workflows.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for mcp_servers
CREATE POLICY "Members can view MCP servers"
  ON mcp_servers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_servers.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage MCP servers"
  ON mcp_servers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_servers.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_servers.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for mcp_server_tools
CREATE POLICY "Members can view MCP server tools"
  ON mcp_server_tools FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_server_tools.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage MCP server tools"
  ON mcp_server_tools FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_server_tools.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_server_tools.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for mcp_server_executions
CREATE POLICY "Members can view MCP executions"
  ON mcp_server_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_server_executions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create MCP executions"
  ON mcp_server_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = mcp_server_executions.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- RLS Policies for voice_agent_calls
CREATE POLICY "Members can view voice calls"
  ON voice_agent_calls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = voice_agent_calls.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage voice calls"
  ON voice_agent_calls FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = voice_agent_calls.organization_id
      AND organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = voice_agent_calls.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON ai_agents;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON agent_workflows;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON agent_workflows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON mcp_servers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON mcp_servers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON mcp_server_tools;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON mcp_server_tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();