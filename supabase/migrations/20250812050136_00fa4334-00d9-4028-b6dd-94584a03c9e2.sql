-- Add per-slot lesson and break durations to tutor_schedule
-- These columns will be used by generate_tutor_time_slots() to split time into windows
ALTER TABLE public.tutor_schedule
  ADD COLUMN IF NOT EXISTS lesson_duration integer DEFAULT 60 CHECK (lesson_duration > 0 AND lesson_duration <= 240),
  ADD COLUMN IF NOT EXISTS break_duration integer DEFAULT 15 CHECK (break_duration >= 0 AND break_duration <= 120);

-- Optional: comments for clarity
COMMENT ON COLUMN public.tutor_schedule.lesson_duration IS 'Lesson duration in minutes for slots generated within this schedule window';
COMMENT ON COLUMN public.tutor_schedule.break_duration IS 'Break duration in minutes between generated lesson slots';