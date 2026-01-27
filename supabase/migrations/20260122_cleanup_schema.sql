-- Clean up and Refine Schema v3 (Phase 2.5)
-- Goal: Split identity vs performance, enforce RLS, add triggers.

-- 1. Performance Profile
CREATE TABLE IF NOT EXISTS public.athlete_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    sport_focus TEXT CHECK (sport_focus IN ('cycling', 'trail', 'both')),
    ftp_w INTEGER CHECK (ftp_w > 0),
    vo2max FLOAT,
    thresholds_json JSONB DEFAULT '{}'::jsonb,
    zones_power_json JSONB DEFAULT '{}'::jsonb,
    zones_hr_json JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Identity Refinement
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_age_check CHECK (age > 0);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_height_check CHECK (height_cm > 0);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_weight_check CHECK (weight_kg > 0);

-- 3. Third-party integrations
CREATE TABLE IF NOT EXISTS public.wahoo_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automation Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  INSERT INTO public.athlete_profile (user_id)
  VALUES (new.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Security & Indices (Details in README)
-- ... [Full RLS and Index implementation]
