
-- Function to get tutor lessons by date
CREATE OR REPLACE FUNCTION public.get_tutor_lessons_by_date(
  p_tutor_id UUID,
  p_date DATE
) 
RETURNS JSONB[] AS $$
DECLARE
  lessons_array JSONB[];
BEGIN
  SELECT array_agg(
    jsonb_build_object(
      'id', l.id,
      'date', l.date,
      'time', l.time,
      'duration', l.duration,
      'status', l.status,
      'student', jsonb_build_object(
        'id', s.id,
        'first_name', s.first_name,
        'last_name', s.last_name
      ),
      'subject', jsonb_build_object(
        'name', subj.name
      )
    )
  )
  INTO lessons_array
  FROM public.lessons l
  JOIN public.profiles s ON l.student_id = s.id
  JOIN public.subjects subj ON l.subject_id = subj.id
  WHERE l.tutor_id = p_tutor_id
  AND l.date = p_date;
  
  RETURN COALESCE(lessons_array, ARRAY[]::JSONB[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
