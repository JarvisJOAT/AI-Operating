-- =============================================
-- Landing Pages Schema Migration
-- =============================================
-- Creates tables for Linktr.ee-style landing page hub
-- with link management, video showcase, and analytics tracking
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LANDING PAGES TABLE
-- =============================================
-- Main configuration table for landing pages
-- Each organization can have multiple landing pages

CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Page Configuration
  slug text UNIQUE, -- Custom URL slug (e.g., /links/mypage)
  title text NOT NULL,
  description text,
  
  -- Branding
  logo_url text,
  background_image_url text,
  background_color text DEFAULT '#0f172a', -- Slate-900
  accent_color text DEFAULT '#3b82f6', -- Primary-500
  
  -- Theme Settings (JSON for flexibility)
  theme_settings jsonb DEFAULT '{
    "layout": "standard",
    "fontFamily": "Inter",
    "showSocialIcons": true,
    "showVideos": true,
    "darkMode": true
  }'::jsonb,
  
  -- Status
  is_active boolean DEFAULT true,
  is_public boolean DEFAULT true,
  
  -- Analytics
  view_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_landing_pages_organization ON landing_pages(organization_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_landing_pages_is_active ON landing_pages(is_active) WHERE is_active = true;

-- =============================================
-- LANDING PAGE LINKS TABLE
-- =============================================
-- Individual links displayed on the landing page

CREATE TABLE IF NOT EXISTS landing_page_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Link Configuration
  title text NOT NULL,
  url text NOT NULL,
  description text,
  
  -- Icon (icon name or custom URL)
  icon text, -- e.g., 'Globe', 'Instagram', 'Mail' or custom URL
  icon_type text DEFAULT 'lucide' CHECK (icon_type IN ('lucide', 'url', 'emoji')),
  
  -- Type & Category
  link_type text DEFAULT 'custom' CHECK (link_type IN ('website', 'social', 'custom', 'email', 'phone')),
  category text, -- Optional grouping
  
  -- Display Options
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  
  -- Custom Styling (optional)
  custom_style jsonb DEFAULT '{}'::jsonb,
  
  -- Analytics
  click_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_landing_page_links_page ON landing_page_links(landing_page_id);
CREATE INDEX idx_landing_page_links_order ON landing_page_links(landing_page_id, order_index);
CREATE INDEX idx_landing_page_links_type ON landing_page_links(link_type);

-- =============================================
-- LANDING PAGE VIDEOS TABLE
-- =============================================
-- Video showcase section

CREATE TABLE IF NOT EXISTS landing_page_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Video Configuration
  title text NOT NULL,
  description text,
  video_url text NOT NULL, -- YouTube, Vimeo, or hosted URL
  thumbnail_url text, -- Custom thumbnail (optional)
  
  -- Video Type
  video_type text DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'hosted', 'embed')),
  
  -- Display Options
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  
  -- Duration (optional, in seconds)
  duration_seconds integer,
  
  -- Analytics
  play_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_landing_page_videos_page ON landing_page_videos(landing_page_id);
CREATE INDEX idx_landing_page_videos_order ON landing_page_videos(landing_page_id, order_index);

-- =============================================
-- LANDING PAGE ANALYTICS TABLE
-- =============================================
-- Detailed analytics tracking for landing pages

CREATE TABLE IF NOT EXISTS landing_page_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'link_click', 'video_play', 'video_complete', 'social_click')),
  
  -- Related Item (optional)
  link_id uuid REFERENCES landing_page_links(id) ON DELETE SET NULL,
  video_id uuid REFERENCES landing_page_videos(id) ON DELETE SET NULL,
  
  -- Visitor Information (anonymized)
  visitor_id text, -- Anonymous visitor identifier
  referrer text,
  user_agent text,
  country_code text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  
  -- Additional Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamp
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for analytics queries
CREATE INDEX idx_landing_page_analytics_page ON landing_page_analytics(landing_page_id);
CREATE INDEX idx_landing_page_analytics_event ON landing_page_analytics(event_type);
CREATE INDEX idx_landing_page_analytics_timestamp ON landing_page_analytics(timestamp);
CREATE INDEX idx_landing_page_analytics_link ON landing_page_analytics(link_id) WHERE link_id IS NOT NULL;
CREATE INDEX idx_landing_page_analytics_video ON landing_page_analytics(video_id) WHERE video_id IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_analytics ENABLE ROW LEVEL SECURITY;

-- Landing Pages Policies
CREATE POLICY "Users can view their organization's landing pages"
  ON landing_pages FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Public landing pages can be viewed by anyone
CREATE POLICY "Public landing pages are viewable by everyone"
  ON landing_pages FOR SELECT
  USING (is_public = true AND is_active = true);

CREATE POLICY "Users can insert landing pages for their organization"
  ON landing_pages FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's landing pages"
  ON landing_pages FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their organization's landing pages"
  ON landing_pages FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Landing Page Links Policies
CREATE POLICY "Users can manage links for their landing pages"
  ON landing_page_links FOR ALL
  USING (
    landing_page_id IN (
      SELECT id FROM landing_pages WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Public links are viewable
CREATE POLICY "Public landing page links are viewable"
  ON landing_page_links FOR SELECT
  USING (
    landing_page_id IN (
      SELECT id FROM landing_pages 
      WHERE is_public = true AND is_active = true
    )
    AND is_active = true
  );

-- Landing Page Videos Policies
CREATE POLICY "Users can manage videos for their landing pages"
  ON landing_page_videos FOR ALL
  USING (
    landing_page_id IN (
      SELECT id FROM landing_pages WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Public videos are viewable
CREATE POLICY "Public landing page videos are viewable"
  ON landing_page_videos FOR SELECT
  USING (
    landing_page_id IN (
      SELECT id FROM landing_pages 
      WHERE is_public = true AND is_active = true
    )
    AND is_active = true
  );

-- Analytics Policies
CREATE POLICY "Users can view analytics for their landing pages"
  ON landing_page_analytics FOR SELECT
  USING (
    landing_page_id IN (
      SELECT id FROM landing_pages WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Allow anonymous analytics inserts (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON landing_page_analytics FOR INSERT
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to increment link click count
CREATE OR REPLACE FUNCTION increment_link_click(p_link_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE landing_page_links 
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment video play count
CREATE OR REPLACE FUNCTION increment_video_play(p_video_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE landing_page_videos 
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment page view count
CREATE OR REPLACE FUNCTION increment_page_view(p_page_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE landing_pages 
  SET view_count = view_count + 1,
      updated_at = now()
  WHERE id = p_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_landing_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_pages_updated_at();

CREATE TRIGGER landing_page_links_updated_at
  BEFORE UPDATE ON landing_page_links
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_pages_updated_at();

CREATE TRIGGER landing_page_videos_updated_at
  BEFORE UPDATE ON landing_page_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_pages_updated_at();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE landing_pages IS 'Main configuration for Linktr.ee-style landing pages';
COMMENT ON TABLE landing_page_links IS 'Individual links displayed on landing pages';
COMMENT ON TABLE landing_page_videos IS 'Video showcase items for landing pages';
COMMENT ON TABLE landing_page_analytics IS 'Analytics events for landing page interactions';

COMMENT ON COLUMN landing_pages.theme_settings IS 'JSON object containing theme configuration options';
COMMENT ON COLUMN landing_page_links.icon_type IS 'Type of icon: lucide (component name), url (image), or emoji';
COMMENT ON COLUMN landing_page_analytics.visitor_id IS 'Anonymous identifier for visitor tracking (no PII)';

