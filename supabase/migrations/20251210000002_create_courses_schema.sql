-- =============================================
-- Courses & Education Schema Migration
-- =============================================
-- Creates tables for educational content management
-- with flexible pricing (free, one-time, subscription)
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- COURSES TABLE
-- =============================================
-- Main courses catalog with flexible pricing

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Course Information
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  short_description text, -- For cards/previews (max ~150 chars)
  
  -- Media
  thumbnail_url text,
  preview_video_url text, -- Optional preview video
  
  -- Categorization
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Pricing Configuration
  price_type text NOT NULL CHECK (price_type IN ('free', 'one_time', 'subscription')),
  price numeric DEFAULT 0 CHECK (price >= 0),
  currency text DEFAULT 'USD',
  
  -- Subscription Details (if subscription type)
  subscription_interval text CHECK (subscription_interval IN ('monthly', 'yearly', 'weekly')),
  
  -- Course Metadata
  duration_minutes integer, -- Total duration in minutes
  lessons_count integer DEFAULT 0,
  
  -- Content Types Available
  has_video boolean DEFAULT false,
  has_pdf boolean DEFAULT false,
  has_interactive boolean DEFAULT false,
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  
  -- Access Control
  requires_account boolean DEFAULT false, -- Free courses can optionally not require account
  
  -- Statistics
  enrollment_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  rating_count integer DEFAULT 0,
  
  -- Instructor (optional)
  instructor_name text,
  instructor_bio text,
  instructor_avatar_url text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create indexes
CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_slug ON courses(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_price_type ON courses(price_type);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(is_featured) WHERE is_featured = true;

-- =============================================
-- COURSE CONTENT TABLE
-- =============================================
-- Individual content items within a course

CREATE TABLE IF NOT EXISTS course_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Content Information
  title text NOT NULL,
  description text,
  
  -- Content Type
  content_type text NOT NULL CHECK (content_type IN ('video', 'pdf', 'text', 'quiz', 'interactive', 'resource')),
  
  -- Content Location
  content_url text, -- URL for video, PDF, or external content
  content_body text, -- For text/markdown content stored directly
  
  -- Media Details
  duration_minutes integer, -- For videos
  file_size_bytes bigint, -- For downloadable content
  
  -- Organization
  module_name text, -- Optional module/section grouping
  order_index integer DEFAULT 0,
  
  -- Access Control
  is_preview boolean DEFAULT false, -- Can be viewed without purchase
  is_downloadable boolean DEFAULT false,
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_course_content_course ON course_content(course_id);
CREATE INDEX idx_course_content_order ON course_content(course_id, order_index);
CREATE INDEX idx_course_content_type ON course_content(content_type);
CREATE INDEX idx_course_content_preview ON course_content(is_preview) WHERE is_preview = true;

-- =============================================
-- COURSE ENROLLMENTS TABLE
-- =============================================
-- Track user enrollments and progress

CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- User Information
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text, -- For enrollments without account
  
  -- Enrollment Type
  enrollment_type text NOT NULL CHECK (enrollment_type IN ('free', 'purchased', 'subscription', 'gifted', 'promotional')),
  
  -- Progress Tracking
  progress jsonb DEFAULT '{
    "completed_content": [],
    "current_content_id": null,
    "last_position_seconds": 0,
    "completion_percentage": 0
  }'::jsonb,
  
  -- Completion Status
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  
  -- Certificate (optional)
  certificate_issued boolean DEFAULT false,
  certificate_url text,
  
  -- Timestamps
  enrolled_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  
  -- Ensure unique enrollment per user per course
  UNIQUE(course_id, user_id),
  UNIQUE(course_id, user_email)
);

-- Create indexes
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_email ON course_enrollments(user_email) WHERE user_email IS NOT NULL;

-- =============================================
-- COURSE PURCHASES TABLE
-- =============================================
-- Track course purchases and payments

CREATE TABLE IF NOT EXISTS course_purchases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE SET NULL,
  
  -- Purchaser Information
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  
  -- Purchase Details
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'crypto', 'manual', 'promotional')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  
  -- Amount
  amount_paid numeric NOT NULL CHECK (amount_paid >= 0),
  currency text DEFAULT 'USD',
  
  -- Transaction Details
  transaction_id text, -- External payment processor ID
  payment_intent_id text, -- Stripe payment intent
  
  -- Subscription Details (if applicable)
  is_subscription boolean DEFAULT false,
  subscription_id text, -- External subscription ID
  subscription_status text CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_expires_at timestamptz,
  
  -- Refund Information
  is_refunded boolean DEFAULT false,
  refunded_at timestamptz,
  refund_amount numeric,
  refund_reason text,
  
  -- Promotional
  coupon_code text,
  discount_amount numeric DEFAULT 0,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  purchased_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_course_purchases_course ON course_purchases(course_id);
CREATE INDEX idx_course_purchases_user ON course_purchases(user_id);
CREATE INDEX idx_course_purchases_email ON course_purchases(user_email);
CREATE INDEX idx_course_purchases_status ON course_purchases(payment_status);
CREATE INDEX idx_course_purchases_transaction ON course_purchases(transaction_id);

-- =============================================
-- COURSE REVIEWS TABLE
-- =============================================
-- Course reviews and ratings

CREATE TABLE IF NOT EXISTS course_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES course_enrollments(id) ON DELETE SET NULL,
  
  -- Reviewer
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text,
  
  -- Review Content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  
  -- Status
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true, -- For moderation
  is_featured boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One review per user per course
  UNIQUE(course_id, user_id)
);

-- Create indexes
CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Courses Policies
-- Published courses are viewable by everyone
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published');

-- Organization members can view all their courses
CREATE POLICY "Organization members can view all courses"
  ON courses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can manage courses"
  ON courses FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Course Content Policies
-- Preview content is viewable by everyone
CREATE POLICY "Preview content is viewable by everyone"
  ON course_content FOR SELECT
  USING (
    is_preview = true 
    AND is_active = true
    AND course_id IN (SELECT id FROM courses WHERE status = 'published')
  );

-- Enrolled users can view course content
CREATE POLICY "Enrolled users can view course content"
  ON course_content FOR SELECT
  USING (
    course_id IN (
      SELECT course_id FROM course_enrollments 
      WHERE user_id = auth.uid()
    )
    AND is_active = true
  );

-- Organization members can manage content
CREATE POLICY "Organization members can manage course content"
  ON course_content FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Enrollment Policies
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create enrollments for themselves"
  ON course_enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own enrollment progress"
  ON course_enrollments FOR UPDATE
  USING (user_id = auth.uid());

-- Organization members can view all enrollments
CREATE POLICY "Organization members can view course enrollments"
  ON course_enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Purchase Policies
CREATE POLICY "Users can view their own purchases"
  ON course_purchases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create purchases"
  ON course_purchases FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Organization members can view all purchases
CREATE POLICY "Organization members can view course purchases"
  ON course_purchases FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Review Policies
CREATE POLICY "Approved reviews are viewable by everyone"
  ON course_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can manage their own reviews"
  ON course_reviews FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update course statistics
CREATE OR REPLACE FUNCTION update_course_stats(p_course_id uuid)
RETURNS void AS $$
DECLARE
  v_avg_rating numeric;
  v_rating_count integer;
  v_enrollment_count integer;
BEGIN
  -- Calculate average rating
  SELECT 
    COALESCE(AVG(rating)::numeric, 0),
    COUNT(*)
  INTO v_avg_rating, v_rating_count
  FROM course_reviews
  WHERE course_id = p_course_id AND is_approved = true;
  
  -- Calculate enrollment count
  SELECT COUNT(*)
  INTO v_enrollment_count
  FROM course_enrollments
  WHERE course_id = p_course_id;
  
  -- Update course
  UPDATE courses
  SET 
    average_rating = ROUND(v_avg_rating, 2),
    rating_count = v_rating_count,
    enrollment_count = v_enrollment_count,
    updated_at = now()
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update content count
CREATE OR REPLACE FUNCTION update_course_content_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses
  SET 
    lessons_count = (
      SELECT COUNT(*) FROM course_content 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
      AND is_active = true
    ),
    duration_minutes = (
      SELECT COALESCE(SUM(duration_minutes), 0) 
      FROM course_content 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
      AND is_active = true
    ),
    has_video = EXISTS (
      SELECT 1 FROM course_content 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
      AND content_type = 'video' AND is_active = true
    ),
    has_pdf = EXISTS (
      SELECT 1 FROM course_content 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
      AND content_type = 'pdf' AND is_active = true
    ),
    has_interactive = EXISTS (
      SELECT 1 FROM course_content 
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id) 
      AND content_type IN ('quiz', 'interactive') AND is_active = true
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for content stats
CREATE TRIGGER update_course_content_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON course_content
  FOR EACH ROW
  EXECUTE FUNCTION update_course_content_stats();

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER course_content_updated_at
  BEFORE UPDATE ON course_content
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER course_purchases_updated_at
  BEFORE UPDATE ON course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

CREATE TRIGGER course_reviews_updated_at
  BEFORE UPDATE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_courses_updated_at();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE courses IS 'Main courses catalog with flexible pricing (free, one-time, subscription)';
COMMENT ON TABLE course_content IS 'Individual content items (videos, PDFs, quizzes) within courses';
COMMENT ON TABLE course_enrollments IS 'User enrollments and progress tracking';
COMMENT ON TABLE course_purchases IS 'Payment records for course purchases';
COMMENT ON TABLE course_reviews IS 'User reviews and ratings for courses';

COMMENT ON COLUMN courses.price_type IS 'Pricing model: free, one_time (single purchase), or subscription';
COMMENT ON COLUMN courses.requires_account IS 'If false, free courses can be accessed without login';
COMMENT ON COLUMN course_content.is_preview IS 'Preview content can be viewed without purchasing';
COMMENT ON COLUMN course_enrollments.progress IS 'JSON tracking completed items, current position, and percentage';
COMMENT ON COLUMN course_purchases.payment_method IS 'Payment processor: stripe, paypal, crypto, manual, promotional';

