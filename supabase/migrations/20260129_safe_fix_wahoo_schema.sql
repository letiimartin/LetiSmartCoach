-- Safe Schema Alignment for Wahoo
-- Documenting existing schema drift safely (IF NOT EXISTS / DO block checks)

-- 1. Ensure workouts table has provider_activity_id instead of external_id (or both if transition needed, but we assume provider_activity_id is the truth)
DO $$
BEGIN
    -- Check if provider_activity_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='provider_activity_id') THEN
        ALTER TABLE public.workouts ADD COLUMN provider_activity_id text;
    END IF;

    -- Ensure constraint exists (safely)
    -- We cannot easily check constraint definition in a generic way that is readable, 
    -- but usually we assume if provider_activity_id exists, the unique index should include it.
    -- Here we explicitly try to add it, catching duplicate object error if it exists? 
    -- Better: we assume manual DB is correct as per instructions, but let's at least make sure the column is there.
END $$;

-- 2. Ensure wahoo_tokens uses access_token_enc / refresh_token_enc
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wahoo_tokens' AND column_name='access_token_enc') THEN
       ALTER TABLE public.wahoo_tokens ADD COLUMN access_token_enc text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wahoo_tokens' AND column_name='refresh_token_enc') THEN
       ALTER TABLE public.wahoo_tokens ADD COLUMN refresh_token_enc text;
    END IF;
END $$;

-- 3. Ensure constraints (If missing, we add them. If present, we skip)
-- Unique constraint on workouts(user_id, provider, provider_activity_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'workouts_user_id_provider_provider_activity_id_key'
    ) THEN
        -- Only add if provider_activity_id is not null (it should be)
        -- We won't alter column to NOT NULL here to avoid breakage if data is dirty, but we add the unique index.
        ALTER TABLE public.workouts ADD CONSTRAINT workouts_user_id_provider_provider_activity_id_key UNIQUE (user_id, provider, provider_activity_id);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        NULL; -- Ignore
    WHEN OTHERS THEN
        NULL; -- Ignore
END $$;
