-- ============================================================
-- Business Apps Registry Schema
-- Central registry for managing business applications across organizations
-- ============================================================

-- ============================================================
-- BUSINESS APPS TABLE
-- Master catalog of available business applications
-- ============================================================
CREATE TABLE IF NOT EXISTS business_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- e.g., 'keys-open-doors', 'food-truck', 'construction-mgmt'
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'real-estate', 'food-service', 'construction', etc.
  icon_url TEXT,
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature descriptions
  pricing JSONB DEFAULT '{}'::jsonb, -- { base_price: 0, billing_period: 'monthly', features_included: [] }
  is_active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  documentation_url TEXT,
  api_base_url TEXT, -- Base URL for the app's API
  health_check_endpoint TEXT DEFAULT '/health',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial business apps
INSERT INTO business_apps (name, slug, display_name, description, category, features, is_active) VALUES
  ('Keys Open Doors', 'keys-open-doors', 'Keys Open Doors', 
   'Automated real estate deal scraping and Instagram marketing platform', 
   'real-estate',
   '["InvestorLift scraping", "AI caption generation", "Instagram auto-posting", "Deal analytics"]'::jsonb,
   true),
  ('Food Truck Ordering', 'food-truck', 'Food Truck Ordering', 
   'Mobile ordering system with AI voice agent for food trucks and restaurants', 
   'food-service',
   '["AI voice ordering", "Real-time order tracking", "Payment processing", "SMS notifications"]'::jsonb,
   true),
  ('Construction Manager', 'construction-mgmt', 'Construction Manager', 
   'Project management with multilingual communication and expense tracking', 
   'construction',
   '["Project management", "Receipt OCR", "Real-time translation", "Document versioning"]'::jsonb,
   true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- APP INSTANCES TABLE
-- Each organization's deployed instance of an app
-- ============================================================
CREATE TABLE IF NOT EXISTS app_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES business_apps(id) ON DELETE RESTRICT,
  instance_name TEXT NOT NULL, -- Custom name for this instance
  status TEXT NOT NULL DEFAULT 'pending_setup', -- pending_setup, active, paused, suspended, archived
  deployment_url TEXT, -- URL where this instance's API is deployed
  database_schema TEXT, -- If using schema-per-tenant, the schema name
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never_synced', -- never_synced, syncing, synced, sync_failed
  sync_error TEXT,
  usage_stats JSONB DEFAULT '{}'::jsonb, -- { api_calls_today: 0, storage_used_mb: 0, etc. }
  billing_status TEXT DEFAULT 'active', -- active, past_due, suspended
  subscription_id TEXT, -- Reference to Stripe subscription if applicable
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, app_id) -- One instance of each app per org
);

ALTER TABLE app_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their own app instances." ON app_instances
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM organization_members WHERE organization_id = app_instances.organization_id));
CREATE POLICY "Admins can manage app instances." ON app_instances
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM organization_members 
    WHERE organization_id = app_instances.organization_id 
    AND role IN ('owner', 'admin')
  ));

CREATE INDEX idx_app_instances_org ON app_instances(organization_id);
CREATE INDEX idx_app_instances_app ON app_instances(app_id);
CREATE INDEX idx_app_instances_status ON app_instances(status);

-- ============================================================
-- APP CONFIGURATIONS TABLE
-- Configuration settings for each app instance
-- ============================================================
CREATE TABLE IF NOT EXISTS app_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_instance_id UUID NOT NULL REFERENCES app_instances(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  is_secret BOOLEAN DEFAULT false, -- If true, value should be encrypted
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_instance_id, config_key)
);

ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage app configurations." ON app_configurations
  FOR ALL USING (app_instance_id IN (
    SELECT id FROM app_instances 
    WHERE auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = app_instances.organization_id 
      AND role IN ('owner', 'admin')
    )
  ));

CREATE INDEX idx_app_configurations_instance ON app_configurations(app_instance_id);

-- ============================================================
-- APP SYNC LOGS TABLE
-- History of data synchronization between apps and AI-Operating
-- ============================================================
CREATE TABLE IF NOT EXISTS app_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_instance_id UUID NOT NULL REFERENCES app_instances(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'partial'
  records_synced INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  sync_details JSONB DEFAULT '{}'::jsonb -- Additional details about what was synced
);

ALTER TABLE app_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view sync logs for their apps." ON app_sync_logs
  FOR SELECT USING (app_instance_id IN (
    SELECT id FROM app_instances 
    WHERE auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = app_instances.organization_id
    )
  ));

CREATE INDEX idx_app_sync_logs_instance ON app_sync_logs(app_instance_id);
CREATE INDEX idx_app_sync_logs_started ON app_sync_logs(started_at);

-- ============================================================
-- APP HEALTH METRICS TABLE
-- Real-time health metrics for monitoring
-- ============================================================
CREATE TABLE IF NOT EXISTS app_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_instance_id UUID NOT NULL REFERENCES app_instances(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'api_latency', 'error_rate', 'cpu_usage', etc.
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT, -- 'ms', 'percent', 'count', etc.
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_app_health_metrics_instance ON app_health_metrics(app_instance_id);
CREATE INDEX idx_app_health_metrics_recorded ON app_health_metrics(recorded_at);

-- Partition by time for efficient queries (optional, for high-volume deployments)
-- ALTER TABLE app_health_metrics SET (autovacuum_vacuum_scale_factor = 0.0);

-- ============================================================
-- APP EVENTS TABLE
-- Audit log of important events
-- ============================================================
CREATE TABLE IF NOT EXISTS app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_instance_id UUID REFERENCES app_instances(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'instance_created', 'config_changed', 'status_changed', 'error', etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their app events." ON app_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_app_events_instance ON app_events(app_instance_id);
CREATE INDEX idx_app_events_org ON app_events(organization_id);
CREATE INDEX idx_app_events_type ON app_events(event_type);
CREATE INDEX idx_app_events_created ON app_events(created_at);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get active app instances for an organization
CREATE OR REPLACE FUNCTION get_organization_apps(org_id UUID)
RETURNS TABLE (
  instance_id UUID,
  app_name TEXT,
  app_slug TEXT,
  instance_name TEXT,
  status TEXT,
  last_sync_at TIMESTAMPTZ,
  usage_stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id as instance_id,
    ba.display_name as app_name,
    ba.slug as app_slug,
    ai.instance_name,
    ai.status,
    ai.last_sync_at,
    ai.usage_stats
  FROM app_instances ai
  JOIN business_apps ba ON ai.app_id = ba.id
  WHERE ai.organization_id = org_id
  AND ba.is_active = true
  ORDER BY ai.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record an app event
CREATE OR REPLACE FUNCTION record_app_event(
  p_app_instance_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb,
  p_actor_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_event_id UUID;
BEGIN
  -- Get organization ID from app instance
  SELECT organization_id INTO v_org_id 
  FROM app_instances 
  WHERE id = p_app_instance_id;
  
  -- Insert event
  INSERT INTO app_events (
    app_instance_id, 
    organization_id, 
    event_type, 
    event_data, 
    actor_id
  ) VALUES (
    p_app_instance_id,
    v_org_id,
    p_event_type,
    p_event_data,
    p_actor_id
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update updated_at on app_instances
CREATE TRIGGER update_app_instances_updated_at
  BEFORE UPDATE ON app_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on app_configurations
CREATE TRIGGER update_app_configurations_updated_at
  BEFORE UPDATE ON app_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log status changes
CREATE OR REPLACE FUNCTION log_app_instance_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO app_events (app_instance_id, organization_id, event_type, event_data)
    VALUES (
      NEW.id, 
      NEW.organization_id, 
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_instance_status_change
  AFTER UPDATE ON app_instances
  FOR EACH ROW EXECUTE FUNCTION log_app_instance_status_change();

