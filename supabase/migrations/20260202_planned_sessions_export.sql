-- Add export columns to planned_sessions
ALTER TABLE public.planned_sessions 
ADD COLUMN IF NOT EXISTS export_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS export_last_error text,
ADD COLUMN IF NOT EXISTS exported_at timestamptz;

-- Ensure wahoo_tokens has updated_at and trigger
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wahoo_tokens' AND column_name='updated_at') THEN
        ALTER TABLE public.wahoo_tokens ADD COLUMN updated_at timestamptz DEFAULT timezone('utc', now());
    END IF;
END $$;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_wahoo_tokens_updated_at ON public.wahoo_tokens;
CREATE TRIGGER set_wahoo_tokens_updated_at 
  BEFORE UPDATE ON wahoo_tokens 
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
