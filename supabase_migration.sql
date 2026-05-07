-- ============================================================
-- ULTIMATE SPARE PARTS — Database Migration
-- Run this in Supabase SQL Editor AFTER the initial schema
-- ============================================================

-- ── 1. Add missing order columns ─────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS full_name   TEXT,
  ADD COLUMN IF NOT EXISTS phone       TEXT,
  ADD COLUMN IF NOT EXISTS address     TEXT,
  ADD COLUMN IF NOT EXISTS city        TEXT,
  ADD COLUMN IF NOT EXISTS email       TEXT,
  ADD COLUMN IF NOT EXISTS email_sent  BOOLEAN NOT NULL DEFAULT false;

-- Back-fill from shipping_address JSONB (if already populated)
UPDATE public.orders
SET
  full_name = COALESCE(
    shipping_address->>'firstName' || ' ' || shipping_address->>'lastName',
    full_name
  ),
  phone   = COALESCE(shipping_address->>'phone',   phone),
  address = COALESCE(shipping_address->>'address',  address),
  city    = COALESCE(shipping_address->>'city',     city),
  email   = COALESCE(shipping_address->>'email',    email)
WHERE shipping_address IS NOT NULL;

-- ── 2. User profiles table (role management) ──────────────────
-- Supabase Auth handles auth.users — we extend with a profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'user'
             CHECK (role IN ('user', 'admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Trigger: auto-create profile when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.email = current_setting('app.admin_email', true) THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: auto-update updated_at on profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. RLS for profiles ───────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (non-role fields)
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- users can't self-promote

-- Service role has full access
CREATE POLICY "profiles_service_all" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ── 4. Backfill existing orders email field ────────────────────
-- Update orders to store email in flat column for easier admin queries
UPDATE public.orders
SET email = shipping_address->>'email'
WHERE email IS NULL AND shipping_address IS NOT NULL;

-- ── 5. Set admin role for the first admin user ────────────────
-- Replace with your admin email:
-- UPDATE public.profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@yoursite.com');

-- ── 6. Create order_status_history table (audit trail) ────────
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_order_id
  ON public.order_status_history(order_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_service_all" ON public.order_status_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "status_history_user_read" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ── 7. Enable realtime on orders table ───────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
