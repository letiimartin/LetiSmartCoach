-- Migration: Ensure RLS Owner-Only for all tables
-- Generated on 2026-01-27

-- 1. Enable RLS on profiles (if not already)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy policies that use FOR ALL (if they exist)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE policyname LIKE '%legacy%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 3. Helper function to (re)create owner‑only policies for a table
CREATE OR REPLACE FUNCTION public.apply_owner_policy(p_table TEXT, p_user_col TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- SELECT
  EXECUTE format('CREATE POLICY "%s_select" ON %s FOR SELECT USING (auth.uid() = %I)', p_table, p_table, p_user_col);
  -- INSERT
  EXECUTE format('CREATE POLICY "%s_insert" ON %s FOR INSERT WITH CHECK (auth.uid() = %I)', p_table, p_table, p_user_col);
  -- UPDATE
  EXECUTE format('CREATE POLICY "%s_update" ON %s FOR UPDATE USING (auth.uid() = %I) WITH CHECK (auth.uid() = %I)', p_table, p_table, p_user_col, p_user_col);
  -- DELETE
  EXECUTE format('CREATE POLICY "%s_delete" ON %s FOR DELETE USING (auth.uid() = %I)', p_table, p_table, p_user_col);
END;
$$;

-- 4. Apply policies to each table
SELECT public.apply_owner_policy('public.athlete_profile', 'user_id');
SELECT public.apply_owner_policy('public.calendar_events', 'user_id');
SELECT public.apply_owner_policy('public.wahoo_tokens', 'user_id');
SELECT public.apply_owner_policy('public.workouts', 'user_id');
SELECT public.apply_owner_policy('public.best_efforts', 'user_id');
SELECT public.apply_owner_policy('public.training_plans', 'user_id');
SELECT public.apply_owner_policy('public.planned_sessions', 'user_id');
SELECT public.apply_owner_policy('public.coach_messages', 'user_id');
SELECT public.apply_owner_policy('public.user_feedback', 'user_id');
SELECT public.apply_owner_policy('public.profiles', 'id');

-- 5. Ensure indexes on user_id (or id) for fast RLS checks
CREATE INDEX IF NOT EXISTS idx_athlete_profile_user_id ON public.athlete_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_wahoo_tokens_user_id ON public.wahoo_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_best_efforts_user_id ON public.best_efforts(user_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_user_id ON public.training_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_id ON public.planned_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_user_id ON public.coach_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);

-- 6. Cleanup: remove duplicate policies if they already exist (ignore errors)
DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['public.athlete_profile','public.calendar_events','public.wahoo_tokens','public.workouts','public.best_efforts','public.training_plans','public.planned_sessions','public.coach_messages','public.user_feedback','public.profiles']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %s_select ON %s', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %s_insert ON %s', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %s_update ON %s', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %s_delete ON %s', tbl, tbl);
  END LOOP;
END $$;

-- Re‑apply policies after cleanup
SELECT public.apply_owner_policy('public.athlete_profile', 'user_id');
SELECT public.apply_owner_policy('public.calendar_events', 'user_id');
SELECT public.apply_owner_policy('public.wahoo_tokens', 'user_id');
SELECT public.apply_owner_policy('public.workouts', 'user_id');
SELECT public.apply_owner_policy('public.best_efforts', 'user_id');
SELECT public.apply_owner_policy('public.training_plans', 'user_id');
SELECT public.apply_owner_policy('public.planned_sessions', 'user_id');
SELECT public.apply_owner_policy('public.coach_messages', 'user_id');
SELECT public.apply_owner_policy('public.user_feedback', 'user_id');
SELECT public.apply_owner_policy('public.profiles', 'id');

-- End of migration
