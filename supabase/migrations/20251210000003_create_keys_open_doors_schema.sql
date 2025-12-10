-- ===========================================
-- Keys Open Doors - Database Schema
-- Real Estate Scraping and Instagram Automation
-- ===========================================

-- Scraping Jobs Table
-- Tracks each scraping run and its results
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deals_found INT DEFAULT 0,
  deals_new INT DEFAULT 0,
  error_message TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on scraping_jobs
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for scraping_jobs
CREATE POLICY "Organizations can view their own scraping jobs"
  ON scraping_jobs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can create scraping jobs"
  ON scraping_jobs FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can update their scraping jobs"
  ON scraping_jobs FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Scraped Deals Table
-- Stores real estate deals scraped from InvestorLift
CREATE TABLE IF NOT EXISTS scraped_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_id UUID REFERENCES scraping_jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  price DECIMAL(12, 2) NOT NULL,
  arv DECIMAL(12, 2) DEFAULT 0, -- After Repair Value
  beds INT DEFAULT 0,
  baths INT DEFAULT 0,
  sqft INT DEFAULT 0,
  description TEXT,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  deal_url TEXT UNIQUE NOT NULL,
  deal_type TEXT DEFAULT 'wholesale',
  wholesaler TEXT,
  is_posted BOOLEAN DEFAULT FALSE,
  posted_at TIMESTAMPTZ,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scraped_deals_organization ON scraped_deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_scraped_deals_state ON scraped_deals(state);
CREATE INDEX IF NOT EXISTS idx_scraped_deals_city ON scraped_deals(city);
CREATE INDEX IF NOT EXISTS idx_scraped_deals_is_posted ON scraped_deals(is_posted);
CREATE INDEX IF NOT EXISTS idx_scraped_deals_is_approved ON scraped_deals(is_approved);
CREATE INDEX IF NOT EXISTS idx_scraped_deals_scraped_at ON scraped_deals(scraped_at DESC);

-- Enable RLS on scraped_deals
ALTER TABLE scraped_deals ENABLE ROW LEVEL SECURITY;

-- RLS policies for scraped_deals
CREATE POLICY "Organizations can view their own deals"
  ON scraped_deals FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can create deals"
  ON scraped_deals FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can update their deals"
  ON scraped_deals FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can delete their deals"
  ON scraped_deals FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Instagram Posts Table
-- Tracks posts made to Instagram
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES scraped_deals(id) ON DELETE CASCADE,
  post_id TEXT, -- Instagram's post ID
  post_type TEXT DEFAULT 'image' CHECK (post_type IN ('image', 'carousel', 'story')),
  caption TEXT NOT NULL,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed')),
  posted_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for instagram_posts
CREATE INDEX IF NOT EXISTS idx_instagram_posts_organization ON instagram_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_deal ON instagram_posts(deal_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_posted_at ON instagram_posts(posted_at DESC);

-- Enable RLS on instagram_posts
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for instagram_posts
CREATE POLICY "Organizations can view their own posts"
  ON instagram_posts FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can create posts"
  ON instagram_posts FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can update their posts"
  ON instagram_posts FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organizations can delete their posts"
  ON instagram_posts FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Post Analytics Table
-- Tracks engagement metrics for Instagram posts
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES instagram_posts(id) ON DELETE CASCADE,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  reach INT DEFAULT 0,
  impressions INT DEFAULT 0,
  engagement_rate DECIMAL(5, 4) DEFAULT 0.0000,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for post_analytics
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_recorded_at ON post_analytics(recorded_at DESC);

-- Enable RLS on post_analytics
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_analytics
CREATE POLICY "Organizations can view analytics for their posts"
  ON post_analytics FOR SELECT
  USING (post_id IN (
    SELECT id FROM instagram_posts WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Organizations can insert analytics for their posts"
  ON post_analytics FOR INSERT
  WITH CHECK (post_id IN (
    SELECT id FROM instagram_posts WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scraped_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_scraped_deals_updated_at
  BEFORE UPDATE ON scraped_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_scraped_deals_updated_at();

-- ===========================================
-- Comments for documentation
-- ===========================================

COMMENT ON TABLE scraping_jobs IS 'Tracks scraping job runs for the Keys Open Doors real estate automation';
COMMENT ON TABLE scraped_deals IS 'Stores real estate deals scraped from InvestorLift marketplace';
COMMENT ON TABLE instagram_posts IS 'Tracks Instagram posts created from scraped deals';
COMMENT ON TABLE post_analytics IS 'Stores engagement metrics for Instagram posts';

COMMENT ON COLUMN scraped_deals.arv IS 'After Repair Value - estimated value after renovations';
COMMENT ON COLUMN scraped_deals.is_approved IS 'Whether the deal has been approved for posting';
COMMENT ON COLUMN post_analytics.engagement_rate IS 'Calculated engagement rate (interactions/reach)';

