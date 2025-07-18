-- Add necessary fields to enhance the scheduling system

-- Add lesson duration and break duration to tutor_schedule if not exists
ALTER TABLE public.tutor_schedule 
ADD COLUMN IF NOT EXISTS lesson_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS break_duration INTEGER DEFAULT 15;

-- Update existing records to have default values
UPDATE public.tutor_schedule 
SET lesson_duration = 60, break_duration = 15 
WHERE lesson_duration IS NULL OR break_duration IS NULL;

-- Add constraints for better data integrity
ALTER TABLE public.tutor_schedule 
ADD CONSTRAINT lesson_duration_check CHECK (lesson_duration >= 15 AND lesson_duration <= 180),
ADD CONSTRAINT break_duration_check CHECK (break_duration >= 0 AND break_duration <= 60),
ADD CONSTRAINT time_order_check CHECK (start_time < end_time);

-- Create index for better performance on schedule queries
CREATE INDEX IF NOT EXISTS idx_tutor_schedule_tutor_day ON public.tutor_schedule(tutor_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_lessons_tutor_date ON public.lessons(tutor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_lesson_requests_tutor_status ON public.lesson_requests(tutor_id, status);

-- Ensure lesson_requests has all needed fields
ALTER TABLE public.lesson_requests 
ADD COLUMN IF NOT EXISTS lesson_duration INTEGER DEFAULT 60;

-- Add notification triggers for lesson bookings
CREATE OR REPLACE FUNCTION public.handle_lesson_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify tutor about new lesson booking
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.tutor_id,
      'lesson_booked',
      'Новое бронирование',
      'Студент забронировал урок. Подтвердите или отклоните запрос.',
      NEW.id
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Notify student about status change
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.student_id,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'lesson_confirmed'
        WHEN NEW.status = 'cancelled' THEN 'lesson_cancelled'
        ELSE 'lesson_status_updated'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Урок подтвержден'
        WHEN NEW.status = 'cancelled' THEN 'Урок отменен'
        ELSE 'Статус урока изменен'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Ваш урок подтвержден репетитором'
        WHEN NEW.status = 'cancelled' THEN 'Ваш урок был отменен'
        ELSE 'Статус вашего урока изменен'
      END,
      NEW.id
    );
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for lesson notifications
DROP TRIGGER IF EXISTS lesson_booking_notification_trigger ON public.lessons;
CREATE TRIGGER lesson_booking_notification_trigger
AFTER INSERT OR UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.handle_lesson_booking_notification();