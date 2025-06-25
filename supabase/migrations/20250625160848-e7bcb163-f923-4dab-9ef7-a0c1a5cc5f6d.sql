
-- Исправляем функцию генерации временных слотов (убираем зарезервированное слово current_time)
CREATE OR REPLACE FUNCTION public.generate_tutor_time_slots(
  p_tutor_id UUID,
  p_date DATE
) 
RETURNS TABLE (
  slot_id UUID,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
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
    
    WHILE working_time + INTERVAL '1 minute' * COALESCE(schedule_record.lesson_duration, 60) <= schedule_record.end_time LOOP
      slot_start := working_time;
      slot_end := working_time + INTERVAL '1 minute' * COALESCE(schedule_record.lesson_duration, 60);
      
      SELECT INTO existing_lesson *
      FROM public.lessons l
      WHERE l.tutor_id = p_tutor_id
      AND l.start_time::date = p_date
      AND l.start_time::time = slot_start
      AND l.status IN ('pending', 'confirmed', 'upcoming');
      
      RETURN QUERY SELECT 
        gen_random_uuid() as slot_id,
        slot_start,
        slot_end,
        (existing_lesson IS NULL) as is_available;
      
      working_time := slot_end + INTERVAL '1 minute' * COALESCE(schedule_record.break_duration, 15);
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
