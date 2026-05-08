-- ============================================
-- BCBA Supervision Tracker - Database Schema
-- Run this in the Supabase Dashboard SQL Editor
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Table: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  certification_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Table: rbts
-- ============================================
CREATE TABLE IF NOT EXISTS public.rbts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcba_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  certification_number TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rbts_bcba_id ON public.rbts(bcba_id);

ALTER TABLE public.rbts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BCBAs can view own RBTs"
  ON public.rbts FOR SELECT USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can insert own RBTs"
  ON public.rbts FOR INSERT WITH CHECK (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can update own RBTs"
  ON public.rbts FOR UPDATE USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can delete own RBTs"
  ON public.rbts FOR DELETE USING (auth.uid() = bcba_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rbts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Table: clients
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcba_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_bcba_id ON public.clients(bcba_id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BCBAs can view own clients"
  ON public.clients FOR SELECT USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can insert own clients"
  ON public.clients FOR INSERT WITH CHECK (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can update own clients"
  ON public.clients FOR UPDATE USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can delete own clients"
  ON public.clients FOR DELETE USING (auth.uid() = bcba_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Table: monthly_hours
-- ============================================
CREATE TABLE IF NOT EXISTS public.monthly_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcba_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rbt_id UUID NOT NULL REFERENCES public.rbts(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  total_practice_hours NUMERIC(7,2) NOT NULL CHECK (total_practice_hours >= 0),
  required_supervision_hours NUMERIC(7,2) GENERATED ALWAYS AS (total_practice_hours * 0.05) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rbt_id, month, year)
);

CREATE INDEX idx_monthly_hours_bcba_id ON public.monthly_hours(bcba_id);
CREATE INDEX idx_monthly_hours_rbt_month ON public.monthly_hours(rbt_id, year, month);

ALTER TABLE public.monthly_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BCBAs can view own monthly hours"
  ON public.monthly_hours FOR SELECT USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can insert own monthly hours"
  ON public.monthly_hours FOR INSERT WITH CHECK (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can update own monthly hours"
  ON public.monthly_hours FOR UPDATE USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can delete own monthly hours"
  ON public.monthly_hours FOR DELETE USING (auth.uid() = bcba_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.monthly_hours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Table: supervision_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.supervision_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcba_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rbt_id UUID NOT NULL REFERENCES public.rbts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC(5,2) GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_sessions_bcba_id ON public.supervision_sessions(bcba_id);
CREATE INDEX idx_sessions_rbt_id ON public.supervision_sessions(rbt_id);
CREATE INDEX idx_sessions_date ON public.supervision_sessions(session_date);
CREATE INDEX idx_sessions_rbt_month ON public.supervision_sessions(rbt_id, session_date);

ALTER TABLE public.supervision_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BCBAs can view own sessions"
  ON public.supervision_sessions FOR SELECT USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can insert own sessions"
  ON public.supervision_sessions FOR INSERT WITH CHECK (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can update own sessions"
  ON public.supervision_sessions FOR UPDATE USING (auth.uid() = bcba_id);
CREATE POLICY "BCBAs can delete own sessions"
  ON public.supervision_sessions FOR DELETE USING (auth.uid() = bcba_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.supervision_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Trigger: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
