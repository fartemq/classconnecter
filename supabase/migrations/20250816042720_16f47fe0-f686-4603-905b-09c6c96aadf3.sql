-- Update the generate_tutor_time_slots function to properly handle lesson_duration and break_duration
CREATE OR REPLACE FUNCTION public.generate_tutor_time_slots(p_tutor_id uuid, p_date date)
 RETURNS TABLE(slot_id uuid, start_time time without time zone, end_time time without time zone, is_available boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  schedule_record RECORD;
  slot_start TIME;
  slot_end TIME;
  working_time TIME;
  existing_lesson RECORD;
  lesson_duration_minutes INTEGER;
  break_duration_minutes INTEGER;
BEGIN
  FOR schedule_record IN 
    SELECT ts.*, EXTRACT(DOW FROM p_date) as target_dow
    FROM public.tutor_schedule ts
    WHERE ts.tutor_id = p_tutor_id 
    AND ts.day_of_week = EXTRACT(DOW FROM p_date)
    AND ts.is_available = true
  LOOP
    -- Get lesson and break duration, use defaults if not set
    lesson_duration_minutes := COALESCE(schedule_record.lesson_duration, 60);
    break_duration_minutes := COALESCE(schedule_record.break_duration, 15);
    
    working_time := schedule_record.start_time;
    
    -- Generate slots within the working hours
    WHILE working_time + INTERVAL '1 minute' * lesson_duration_minutes <= schedule_record.end_time LOOP
      slot_start := working_time;
      slot_end := working_time + INTERVAL '1 minute' * lesson_duration_minutes;
      
      -- Check if slot conflicts with existing lessons
      SELECT INTO existing_lesson *
      FROM public.lessons l
      WHERE l.tutor_id = p_tutor_id
      AND l.start_time::date = p_date
      AND l.start_time::time = slot_start
      AND l.status IN ('pending', 'confirmed', 'upcoming');
      
      -- Also check lesson_requests that are pending
      IF existing_lesson IS NULL THEN
        SELECT INTO existing_lesson *
        FROM public.lesson_requests lr
        WHERE lr.tutor_id = p_tutor_id
        AND lr.requested_date = p_date
        AND lr.requested_start_time = slot_start
        AND lr.status = 'pending';
      END IF;
      
      -- Check for schedule exceptions
      IF existing_lesson IS NULL THEN
        SELECT INTO existing_lesson *
        FROM public.tutor_schedule_exceptions tse
        WHERE tse.tutor_id = p_tutor_id
        AND tse.date = p_date
        AND tse.is_full_day = true;
      END IF;
      
      RETURN QUERY SELECT 
        gen_random_uuid() as slot_id,
        slot_start,
        slot_end,
        (existing_lesson IS NULL) as is_available;
      
      -- Move to next slot: add lesson duration + break duration
      working_time := slot_end + INTERVAL '1 minute' * break_duration_minutes;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$function$;

-- Ensure notifications are enabled for lesson_requests
CREATE OR REPLACE FUNCTION public.handle_lesson_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify tutor about new lesson request
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.tutor_id,
      'lesson_request',
      'Новый запрос на занятие',
      'Студент отправил вам запрос на занятие. Просмотрите детали и ответьте на запрос.',
      NEW.id
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    -- Notify student about request status change
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.student_id,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'lesson_confirmed'
        WHEN NEW.status = 'rejected' THEN 'lesson_rejected'
        ELSE 'lesson_cancelled'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Занятие подтверждено'
        WHEN NEW.status = 'rejected' THEN 'Запрос отклонен'
        ELSE 'Занятие отменено'
      END,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Репетитор подтвердил ваш запрос на занятие. Урок добавлен в ваше расписание.'
        WHEN NEW.status = 'rejected' THEN 'Репетитор отклонил ваш запрос на занятие.'
        ELSE 'Занятие было отменено.'
      END,
      NEW.id
    );
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for lesson request notifications if it doesn't exist
DROP TRIGGER IF EXISTS lesson_request_notification_trigger ON public.lesson_requests;
CREATE TRIGGER lesson_request_notification_trigger
  AFTER INSERT OR UPDATE ON public.lesson_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lesson_request_notification();