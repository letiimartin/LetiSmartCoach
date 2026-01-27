-- Phase 2.1 Hardening: Strict RLS, Indices, and Triggers

-- 1. FUNCTIONS & TRIGGERS
-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at to all relevant tables
DO $$ 
DECLARE 
    t TEXT;
    target_tables TEXT[] := ARRAY['profiles', 'athlete_profile', 'wahoo_tokens']; 
BEGIN 
    FOREACH t IN ARRAY target_tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- 2. CONSTRAINTS
-- Calendar Events: end_dt >= start_dt
ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_dates_check;
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_dates_check CHECK (end_dt IS NULL OR end_dt >= start_dt);

-- Planned Sessions: export_status
ALTER TABLE public.planned_sessions DROP CONSTRAINT IF EXISTS planned_sessions_status_check;
ALTER TABLE public.planned_sessions ADD CONSTRAINT planned_sessions_status_check CHECK (export_status IN ('pending', 'exported', 'failed'));

-- Athlete Profile: basic checks
ALTER TABLE public.athlete_profile DROP CONSTRAINT IF EXISTS athlete_profile_ftp_check;
ALTER TABLE public.athlete_profile ADD CONSTRAINT athlete_profile_ftp_check CHECK (ftp_w > 0);

-- Training Plans: week dates
ALTER TABLE public.training_plans DROP CONSTRAINT IF EXISTS training_plans_weeks_check;
ALTER TABLE public.training_plans ADD CONSTRAINT training_plans_weeks_check CHECK (week_end >= week_start);

-- 3. INDICES (Performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start ON public.calendar_events(user_id, start_dt);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_date ON public.planned_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_start ON public.workouts(user_id, start_dt);
CREATE INDEX IF NOT EXISTS idx_coach_messages_user_created ON public.coach_messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_best_efforts_compound ON public.best_efforts(user_id, sport, effort_window, recorded_at);

-- 4. STRICT RLS POLICIES
-- Re-apply policies with strict Select/Insert/Update/Delete pattern
DO $$ 
DECLARE 
    t TEXT;
    -- All user_id tables
    tables_to_rls TEXT[] := ARRAY['athlete_profile', 'calendar_events', 'planned_sessions', 'training_plans', 'workouts', 'best_efforts', 'coach_messages', 'user_feedback', 'wahoo_tokens'];
BEGIN 
    FOREACH t IN ARRAY tables_to_rls LOOP
        -- Enable RLS just in case
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop ALL existing policies to ensure clean slate
        EXECUTE format('DROP POLICY IF EXISTS "Owner only select" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Owner only insert" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Owner only update" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Owner only delete" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can only access their own %I" ON public.%I', t, t); -- Access cleanup
        EXECUTE format('DROP POLICY IF EXISTS "Users can only access their own session" ON public.%I', t); -- Typo cleanup if exists

        -- Create strict policies
        EXECUTE format('CREATE POLICY "Owner only select" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Owner only insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Owner only update" ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
        EXECUTE format('CREATE POLICY "Owner only delete" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t);
    END LOOP;
    
    -- Special case for profiles (id vs user_id)
    EXECUTE 'DROP POLICY IF EXISTS "Owner only select" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Owner only insert" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Owner only update" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Owner only delete" ON public.profiles';
    
    EXECUTE 'CREATE POLICY "Owner only select" ON public.profiles FOR SELECT USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Owner only insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Owner only update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Owner only delete" ON public.profiles FOR DELETE USING (auth.uid() = id)';

END $$;
