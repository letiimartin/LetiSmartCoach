-- Safe Schema Alignment for Wahoo (Part 2: summary_json)
-- The user is seeing PGRST204: Could not find the 'summary_json' column.
-- This script safely adds it if missing.

DO $$
BEGIN
    -- Check if summary_json exists in workouts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='summary_json') THEN
        ALTER TABLE public.workouts ADD COLUMN summary_json jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Force schema cache reload just in case
NOTIFY pgrst, 'reload config';
