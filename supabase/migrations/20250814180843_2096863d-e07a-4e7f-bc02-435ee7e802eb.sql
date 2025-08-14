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
BEGIN
  FOR schedule_record IN 
    SELECT ts.*, EXTRACT(DOW FROM p_date) as target_dow
    FROM public.tutor_schedule ts
    WHERE ts.tutor_id = p_tutor_id 
    AND ts.day_of_week = EXTRACT(DOW FROM p_date)
    AND ts.is_available = true
  LOOP
    working_time := schedule_record.start_time;
    
    -- Use lesson_duration and break_duration from schedule_record, fallback to defaults
    WHILE working_time + INTERVAL '1 minute' * COALESCE(schedule_record.lesson_duration, 60) <= schedule_record.end_time LOOP
      slot_start := working_time;
      slot_end := working_time + INTERVAL '1 minute' * COALESCE(schedule_record.lesson_duration, 60);
      
      -- Check if slot conflicts with existing lessons or lesson requests
      SELECT INTO existing_lesson *
      FROM public.lessons l
      WHERE l.tutor_id = p_tutor_id
      AND l.start_time::date = p_date
      AND l.start_time::time = slot_start
      AND l.status IN ('pending', 'confirmed', 'upcoming');
      
      -- Also check lesson_requests
      IF existing_lesson IS NULL THEN
        SELECT INTO existing_lesson *
        FROM public.lesson_requests lr
        WHERE lr.tutor_id = p_tutor_id
        AND lr.requested_date = p_date
        AND lr.requested_start_time = slot_start
        AND lr.status = 'pending';
      END IF;
      
      RETURN QUERY SELECT 
        gen_random_uuid() as slot_id,
        slot_start,
        slot_end,
        (existing_lesson IS NULL) as is_available;
      
      -- Move to next slot: lesson_duration + break_duration
      working_time := slot_end + INTERVAL '1 minute' * COALESCE(schedule_record.break_duration, 15);
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$function$;