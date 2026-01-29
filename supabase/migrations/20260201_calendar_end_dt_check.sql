-- Add constraint to ensure end_dt is after or equal to start_dt
ALTER TABLE public.calendar_events 
ADD CONSTRAINT chk_end_after_start CHECK (end_dt IS NULL OR end_dt >= start_dt);
