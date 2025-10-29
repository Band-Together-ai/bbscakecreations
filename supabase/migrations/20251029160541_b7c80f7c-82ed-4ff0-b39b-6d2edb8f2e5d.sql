-- ==========================================
-- 1. BASE RECIPE ARCHITECTURE + TIME TRACKING
-- ==========================================

ALTER TABLE recipes 
  ADD COLUMN IF NOT EXISTS is_base_recipe BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS base_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS variant_notes TEXT,
  ADD COLUMN IF NOT EXISTS prep_active_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS prep_passive_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS make_ahead BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS make_ahead_window_days INTEGER,
  ADD COLUMN IF NOT EXISTS recommended_freeze_days INTEGER,
  ADD COLUMN IF NOT EXISTS thaw_time_hours INTEGER,
  ADD COLUMN IF NOT EXISTS staging_json JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_recipes_base ON recipes(base_recipe_id) WHERE base_recipe_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_is_base ON recipes(is_base_recipe) WHERE is_base_recipe = true;
CREATE INDEX IF NOT EXISTS idx_recipes_make_ahead ON recipes(make_ahead) WHERE make_ahead = true;

-- ==========================================
-- 2. USER BAKEBOOK TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS user_bakebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bakebooks_user ON user_bakebooks(user_id);

CREATE TABLE IF NOT EXISTS bakebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bakebook_id UUID REFERENCES user_bakebooks(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  folder TEXT DEFAULT 'Saved',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_number INTEGER DEFAULT 0,
  last_made_date TIMESTAMPTZ,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_modifications JSONB,
  notes TEXT,
  learned_tips TEXT[],
  pan_size TEXT,
  bake_time_minutes INTEGER,
  stage_notes JSONB DEFAULT '[]',
  result_feedback TEXT CHECK (result_feedback IN ('success', 'partial', 'failed')),
  share_with_admin BOOLEAN DEFAULT false,
  actual_active_minutes INTEGER,
  actual_passive_minutes INTEGER,
  is_archived BOOLEAN DEFAULT false,
  UNIQUE(bakebook_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_entries_bakebook ON bakebook_entries(bakebook_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_folder ON bakebook_entries(bakebook_id, folder);
CREATE INDEX IF NOT EXISTS idx_entries_recipe ON bakebook_entries(recipe_id);
CREATE INDEX IF NOT EXISTS idx_entries_shared ON bakebook_entries(share_with_admin, result_feedback) WHERE share_with_admin = true;

-- ==========================================
-- 3. BRANDIA'S MASTER BAKEBOOK
-- ==========================================

CREATE TABLE IF NOT EXISTS admin_bakebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_notes TEXT,
  development_stage TEXT CHECK (development_stage IN ('testing', 'refined', 'signature', 'archived')),
  refinement_log JSONB,
  is_canon BOOLEAN DEFAULT false,
  is_favorite_base BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_entries_recipe ON admin_bakebook_entries(recipe_id);
CREATE INDEX IF NOT EXISTS idx_admin_entries_canon ON admin_bakebook_entries(is_canon) WHERE is_canon = true;
CREATE INDEX IF NOT EXISTS idx_admin_entries_base ON admin_bakebook_entries(is_favorite_base) WHERE is_favorite_base = true;

-- ==========================================
-- 4. COMMUNITY INSIGHTS
-- ==========================================

CREATE TABLE IF NOT EXISTS community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  data JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insights_recipe ON community_insights(recipe_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_type ON community_insights(insight_type, confidence_score DESC);

-- ==========================================
-- 5. AFFILIATE CATALOG & WISHLISTS
-- ==========================================

CREATE TABLE IF NOT EXISTS affiliate_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT,
  primary_url TEXT NOT NULL,
  fallback_urls JSONB,
  price_estimate TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_canonical ON affiliate_catalog(canonical_key);
CREATE INDEX IF NOT EXISTS idx_affiliate_active ON affiliate_catalog(is_active, category, display_order);

CREATE TABLE IF NOT EXISTS affiliate_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id UUID,
  canonical_key TEXT REFERENCES affiliate_catalog(canonical_key),
  confidence FLOAT DEFAULT 1.0,
  shown_to_user BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user_key ON affiliate_mentions(user_id, canonical_key);
CREATE INDEX IF NOT EXISTS idx_mentions_source ON affiliate_mentions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_mentions_clicked ON affiliate_mentions(canonical_key, clicked) WHERE clicked = true;

CREATE TABLE IF NOT EXISTS user_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON user_wishlists(user_id);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES user_wishlists(id) ON DELETE CASCADE NOT NULL,
  affiliate_catalog_id UUID REFERENCES affiliate_catalog(id) ON DELETE CASCADE,
  external_product_name TEXT,
  external_product_url TEXT,
  notes TEXT,
  priority TEXT CHECK (priority IN ('Must Have', 'Nice to Have', 'Dreaming')),
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items ON wishlist_items(wishlist_id, display_order);

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

ALTER TABLE user_bakebooks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own bakebook" ON user_bakebooks;
CREATE POLICY "Users manage own bakebook" ON user_bakebooks
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE bakebook_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own entries" ON bakebook_entries;
CREATE POLICY "Users manage own entries" ON bakebook_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_bakebooks WHERE id = bakebook_entries.bakebook_id AND user_id = auth.uid())
  );

ALTER TABLE admin_bakebook_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage master bakebook" ON admin_bakebook_entries;
CREATE POLICY "Admins manage master bakebook" ON admin_bakebook_entries
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view insights" ON community_insights;
DROP POLICY IF EXISTS "System inserts insights" ON community_insights;
CREATE POLICY "Admins view insights" ON community_insights
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));
CREATE POLICY "System inserts insights" ON community_insights
  FOR INSERT WITH CHECK (true);

ALTER TABLE affiliate_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone views active catalog" ON affiliate_catalog;
DROP POLICY IF EXISTS "Admins manage catalog" ON affiliate_catalog;
CREATE POLICY "Anyone views active catalog" ON affiliate_catalog
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage catalog" ON affiliate_catalog
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE affiliate_mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own mentions" ON affiliate_mentions;
DROP POLICY IF EXISTS "System inserts mentions" ON affiliate_mentions;
DROP POLICY IF EXISTS "Admins view all mentions" ON affiliate_mentions;
CREATE POLICY "Users view own mentions" ON affiliate_mentions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System inserts mentions" ON affiliate_mentions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all mentions" ON affiliate_mentions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE user_wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wishlists" ON user_wishlists;
DROP POLICY IF EXISTS "Anyone views public wishlists" ON user_wishlists;
CREATE POLICY "Users manage own wishlists" ON user_wishlists
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone views public wishlists" ON user_wishlists
  FOR SELECT USING (is_public = true);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own wishlist items" ON wishlist_items;
CREATE POLICY "Users manage own wishlist items" ON wishlist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid())
  );

-- ==========================================
-- 7. TIER LIMITS TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION check_bakebook_limit()
RETURNS TRIGGER AS $$
DECLARE
  entry_count INTEGER;
  user_role app_role;
  has_promo BOOLEAN;
  has_temp_access BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO entry_count
  FROM bakebook_entries
  WHERE bakebook_id = NEW.bakebook_id;

  SELECT get_user_role(auth.uid()) INTO user_role;

  SELECT EXISTS(
    SELECT 1 FROM promo_users 
    WHERE user_id = auth.uid() 
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO has_promo;

  SELECT EXISTS(
    SELECT 1 FROM temporary_access 
    WHERE user_id = auth.uid() 
    AND expires_at > now()
  ) INTO has_temp_access;

  IF user_role IN ('admin', 'collaborator', 'paid') OR has_promo OR has_temp_access THEN
    RETURN NEW;
  END IF;

  IF user_role = 'free' THEN
    RAISE EXCEPTION 'Sign in to use BakeBook (it''s free). 🌊';
  END IF;

  IF entry_count >= 10 THEN
    RAISE EXCEPTION 'BakeBook limit reached (10 recipes). Ready for unlimited saves and instant tips? Join the Home Bakers Club! 💕';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_bakebook_limit ON bakebook_entries;
CREATE TRIGGER enforce_bakebook_limit
  BEFORE INSERT ON bakebook_entries
  FOR EACH ROW EXECUTE FUNCTION check_bakebook_limit();

-- ==========================================
-- 8. AUTO-UPDATE TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS update_bakebook_updated_at ON user_bakebooks;
CREATE TRIGGER update_bakebook_updated_at
  BEFORE UPDATE ON user_bakebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_bakebook_updated_at ON admin_bakebook_entries;
CREATE TRIGGER update_admin_bakebook_updated_at
  BEFORE UPDATE ON admin_bakebook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_insights_updated_at ON community_insights;
CREATE TRIGGER update_community_insights_updated_at
  BEFORE UPDATE ON community_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_catalog_updated_at ON affiliate_catalog;
CREATE TRIGGER update_affiliate_catalog_updated_at
  BEFORE UPDATE ON affiliate_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlists_updated_at ON user_wishlists;
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON user_wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();