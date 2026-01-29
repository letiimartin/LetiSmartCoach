-- Comprehensive Safe Schema Alignment for Workouts
-- Ensure ALL expected columns exist to stop the "whack-a-mole" of errors.

DO $$
BEGIN
    -- 1. provider_activity_id (already checked, but good to be safe)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='provider_activity_id') THEN
        ALTER TABLE public.workouts ADD COLUMN provider_activity_id text;
    END IF;

    -- 2. title
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='title') THEN
        ALTER TABLE public.workouts ADD COLUMN title text;
    END IF;

    -- 3. sport
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='sport') THEN
        ALTER TABLE public.workouts ADD COLUMN sport text;
        -- Optional: Add check constraint if not exists (harder to safe-add, skipping for now to avoid errors)
    END IF;

    -- 4. duration_s
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='duration_s') THEN
        ALTER TABLE public.workouts ADD COLUMN duration_s integer;
    END IF;

    -- 5. start_dt
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='start_dt') THEN
        ALTER TABLE public.workouts ADD COLUMN start_dt timestamptz;
        -- Note: If it was created as NOT NULL initially, this might be tricky, but ADD COLUMN usually defaults to nullable.
    END IF;

    -- 6. summary_json (already checked, but ensuring)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='summary_json') THEN
        ALTER TABLE public.workouts ADD COLUMN summary_json jsonb DEFAULT '{}'::jsonb;
    END IF;

    -- 7. Ensure unique constraint is correct (user_id, provider, provider_activity_id)
    -- This relies on provider_activity_id being populated.
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'workouts_user_id_provider_provider_activity_id_key'
    ) THEN
        -- Safely try to add it. If constraint with different name exists, it won't be caught here, 
        -- but this ensures the one we WANT is present.
         ALTER TABLE public.workouts ADD CONSTRAINT workouts_user_id_provider_provider_activity_id_key UNIQUE (user_id, provider, provider_activity_id);
    END IF;

END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload config';
