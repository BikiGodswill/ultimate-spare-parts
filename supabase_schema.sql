-- ============================================================
-- ULTIMATE SPARE PARTS — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Enable required extensions ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- for fuzzy search (optional)

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category      TEXT NOT NULL,
  image_url     TEXT,
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reviews ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)   -- one review per user per product
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id   TEXT UNIQUE,
  payment_intent_id   TEXT,
  items               JSONB NOT NULL DEFAULT '[]',
  shipping_address    JSONB,
  shipping_option     TEXT NOT NULL DEFAULT 'standard',
  shipping_cost       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax                 NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total               NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending', 'paid', 'processing',
                        'shipped', 'delivered', 'cancelled', 'refunded'
                      )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Wishlists ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price       ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at  ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm   ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id   ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id      ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id    ON public.wishlists(user_id);

-- ── Trigger: auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists  ENABLE ROW LEVEL SECURITY;

-- ── Products RLS ──────────────────────────────────────────────
-- Anyone can read products
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

-- Only admin (service role) can write
CREATE POLICY "products_admin_write" ON public.products
  FOR ALL USING (auth.role() = 'service_role');

-- ── Reviews RLS ───────────────────────────────────────────────
-- Anyone can read reviews
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_user_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "reviews_user_delete" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ── Orders RLS ────────────────────────────────────────────────
-- Users can only see their own orders
CREATE POLICY "orders_user_read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Only service role (API routes) can write orders
CREATE POLICY "orders_service_write" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

-- ── Wishlists RLS ─────────────────────────────────────────────
-- Users can manage their own wishlist
CREATE POLICY "wishlists_user_all" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SAMPLE DATA (optional — remove in production)
-- ============================================================
INSERT INTO public.products (name, description, price, category, is_featured, stock, image_url)
VALUES
  (
    'High-Performance Ceramic Brake Pads',
    'Premium ceramic brake pads engineered for superior stopping power and reduced brake fade. Compatible with most sedans and SUVs (2015–2024). Features: low dust formula, quiet operation, OEM-quality hardware included.',
    49.99, 'brakes', true, 48,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
  ),
  (
    'K&N High-Flow Air Filter (Universal)',
    'Washable and reusable high-flow air filter delivering up to 50% more airflow than stock filters. Designed for performance cars and daily drivers alike. Million-mile limited warranty.',
    54.99, 'filters', true, 120,
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600'
  ),
  (
    '4-Piece Shock Absorber Set',
    'Gas-charged monotube shock absorbers providing a smooth, controlled ride. Direct OEM replacement for most vehicles 2010–2023. Includes all mounting hardware.',
    189.99, 'suspension', true, 22,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600'
  ),
  (
    'NGK Iridium Spark Plugs (Set of 4)',
    'Laser-welded iridium fine-wire center electrode for maximum ignitability and throttle response. 100,000-mile service life. Pre-gapped from factory.',
    34.99, 'engine', false, 200,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'
  ),
  (
    'LED Headlight Conversion Kit (H11)',
    'Plug-and-play LED headlight kit producing 6000K cool white output — 3× brighter than halogen. IP68 waterproof, fan-cooled, 50,000-hour lifespan.',
    89.99, 'electrical', true, 75,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'
  ),
  (
    'Timing Belt & Water Pump Kit',
    'Complete OEM-equivalent timing belt kit including water pump, tensioner, and all seals. Perfect for scheduled maintenance at 60,000–100,000 miles.',
    124.99, 'engine', false, 35,
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600'
  ),
  (
    'Stainless Steel Cat-Back Exhaust System',
    'Mandrel-bent 304 stainless steel construction for a deep, sporty exhaust note with +10–15 HP gains. Includes all gaskets and mounting hardware. No cutting required.',
    349.99, 'exhaust', true, 12,
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600'
  ),
  (
    'Synthetic Motor Oil 5W-30 (5 Quart)',
    'Full-synthetic motor oil formulated for modern turbocharged and naturally-aspirated engines. API SN Plus certified. Exceptional protection down to -40°F.',
    29.99, 'filters', false, 500,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'
  );
