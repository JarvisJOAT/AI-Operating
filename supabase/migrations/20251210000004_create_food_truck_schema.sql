-- ===========================================
-- Food Truck - Database Schema
-- Mobile Ordering and AI Voice Agent System
-- ===========================================

-- Menu Categories Table
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_org ON menu_categories(organization_id);
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their menu categories"
  ON menu_categories FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public can view active menu categories"
  ON menu_categories FOR SELECT
  USING (is_active = TRUE);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time INT DEFAULT 10, -- minutes
  calories INT,
  allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
  modifiers JSONB DEFAULT '{}'::jsonb,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_org ON menu_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their menu items"
  ON menu_items FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = TRUE);

-- Customers Table
CREATE TABLE IF NOT EXISTS food_truck_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_ft_customers_org ON food_truck_customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_ft_customers_phone ON food_truck_customers(phone);
ALTER TABLE food_truck_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their customers"
  ON food_truck_customers FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Orders Table
CREATE TABLE IF NOT EXISTS food_truck_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES food_truck_customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  order_type TEXT DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery')),
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  tip DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('cash', 'card', 'mobile', 'crypto')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_id TEXT,
  special_instructions TEXT,
  estimated_ready_at TIMESTAMPTZ,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'voice', 'walk_in')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ft_orders_org ON food_truck_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_ft_orders_customer ON food_truck_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_ft_orders_status ON food_truck_orders(status);
CREATE INDEX IF NOT EXISTS idx_ft_orders_number ON food_truck_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_ft_orders_created ON food_truck_orders(created_at DESC);
ALTER TABLE food_truck_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their orders"
  ON food_truck_orders FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Order Notifications Table
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES food_truck_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'push')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_notifications_order ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_status ON order_notifications(status);
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can view their order notifications"
  ON order_notifications FOR SELECT
  USING (order_id IN (
    SELECT id FROM food_truck_orders WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- Voice Calls Table
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  call_sid TEXT UNIQUE NOT NULL,
  caller_phone TEXT NOT NULL,
  status TEXT DEFAULT 'initiated' 
    CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed', 'transferred')),
  transcript JSONB DEFAULT '[]'::jsonb,
  order_id UUID REFERENCES food_truck_orders(id) ON DELETE SET NULL,
  duration_seconds INT,
  transferred_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_org ON voice_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_sid ON voice_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status);
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their voice calls"
  ON voice_calls FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON food_truck_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.customer_id IS NOT NULL THEN
    UPDATE food_truck_customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total,
      loyalty_points = loyalty_points + FLOOR(NEW.total),
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON food_truck_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- ===========================================
-- Sample Menu Data (for This What I Do BBQ)
-- ===========================================

-- Note: Run this after creating an organization
-- INSERT INTO menu_categories (organization_id, name, description, display_order)
-- VALUES 
--   ('YOUR_ORG_ID', 'Plates', 'Full plates with 2 sides', 1),
--   ('YOUR_ORG_ID', 'Sandwiches', 'BBQ sandwiches', 2),
--   ('YOUR_ORG_ID', 'Sides', 'Delicious sides', 3),
--   ('YOUR_ORG_ID', 'Drinks', 'Beverages', 4);

-- Comments
COMMENT ON TABLE menu_categories IS 'Food truck menu categories';
COMMENT ON TABLE menu_items IS 'Food truck menu items with pricing and modifiers';
COMMENT ON TABLE food_truck_customers IS 'Food truck customer records with loyalty tracking';
COMMENT ON TABLE food_truck_orders IS 'Food truck orders with status tracking';
COMMENT ON TABLE order_notifications IS 'SMS/Email/Push notifications for orders';
COMMENT ON TABLE voice_calls IS 'AI voice agent call logs and transcripts';

