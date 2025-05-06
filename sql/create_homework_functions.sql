
-- Function to get homework by ID
CREATE OR REPLACE FUNCTION public.get_homework_by_id(homework_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', hw.id,
    'tutor_id', hw.tutor_id,
    'student_id', hw.student_id,
    'subject_id', hw.subject_id,
    'title', hw.title,
    'description', hw.description,
    'file_path', hw.file_path,
    'due_date', hw.due_date,
    'created_at', hw.created_at,
    'updated_at', hw.updated_at,
    'status', hw.status,
    'answer', hw.answer,
    'answer_file_path', hw.answer_file_path,
    'grade', hw.grade,
    'feedback', hw.feedback,
    'subject', jsonb_build_object('name', s.name),
    'tutor', jsonb_build_object('first_name', t.first_name, 'last_name', t.last_name),
    'student', jsonb_build_object('first_name', st.first_name, 'last_name', st.last_name)
  ) INTO result
  FROM public.homework hw
  JOIN public.subjects s ON hw.subject_id = s.id
  JOIN public.profiles t ON hw.tutor_id = t.id
  JOIN public.profiles st ON hw.student_id = st.id
  WHERE hw.id = homework_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create homework
CREATE OR REPLACE FUNCTION public.create_homework(
  tutor_id UUID,
  student_id UUID,
  subject_id UUID,
  title TEXT,
  description TEXT,
  file_path TEXT DEFAULT NULL,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned',
  answer TEXT DEFAULT NULL,
  answer_file_path TEXT DEFAULT NULL,
  grade INT DEFAULT NULL,
  feedback TEXT DEFAULT NULL
) 
RETURNS JSONB AS $$
DECLARE
  new_homework_id UUID;
  result JSONB;
BEGIN
  -- Insert the homework
  INSERT INTO public.homework (
    tutor_id, student_id, subject_id, title, description, 
    file_path, due_date, status, answer, answer_file_path,
    grade, feedback
  )
  VALUES (
    tutor_id, student_id, subject_id, title, description,
    file_path, due_date, status, answer, answer_file_path,
    grade, feedback
  )
  RETURNING id INTO new_homework_id;
  
  -- Get the full homework details using the previous function
  SELECT get_homework_by_id(new_homework_id) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update homework
CREATE OR REPLACE FUNCTION public.update_homework(
  homework_id UUID,
  tutor_id UUID DEFAULT NULL,
  student_id UUID DEFAULT NULL,
  subject_id UUID DEFAULT NULL,
  title TEXT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  file_path TEXT DEFAULT NULL,
  due_date TIMESTAMPTZ DEFAULT NULL,
  status TEXT DEFAULT NULL,
  answer TEXT DEFAULT NULL,
  answer_file_path TEXT DEFAULT NULL,
  grade INT DEFAULT NULL,
  feedback TEXT DEFAULT NULL
) 
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Update only the provided fields
  UPDATE public.homework
  SET
    tutor_id = COALESCE(update_homework.tutor_id, homework.tutor_id),
    student_id = COALESCE(update_homework.student_id, homework.student_id),
    subject_id = COALESCE(update_homework.subject_id, homework.subject_id),
    title = COALESCE(update_homework.title, homework.title),
    description = COALESCE(update_homework.description, homework.description),
    file_path = COALESCE(update_homework.file_path, homework.file_path),
    due_date = COALESCE(update_homework.due_date, homework.due_date),
    status = COALESCE(update_homework.status, homework.status),
    answer = COALESCE(update_homework.answer, homework.answer),
    answer_file_path = COALESCE(update_homework.answer_file_path, homework.answer_file_path),
    grade = COALESCE(update_homework.grade, homework.grade),
    feedback = COALESCE(update_homework.feedback, homework.feedback)
  WHERE id = homework_id;
  
  -- Get the full updated homework using the get function
  SELECT get_homework_by_id(homework_id) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student lessons by date
CREATE OR REPLACE FUNCTION public.get_student_lessons_by_date(
  p_student_id UUID,
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
      'tutor', jsonb_build_object(
        'id', t.id,
        'first_name', t.first_name,
        'last_name', t.last_name
      ),
      'subject', jsonb_build_object(
        'name', s.name
      )
    )
  )
  INTO lessons_array
  FROM public.lessons l
  JOIN public.profiles t ON l.tutor_id = t.id
  JOIN public.subjects s ON l.subject_id = s.id
  WHERE l.student_id = p_student_id
  AND l.date = p_date;
  
  RETURN COALESCE(lessons_array, ARRAY[]::JSONB[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a lesson
CREATE OR REPLACE FUNCTION public.create_lesson(
  student_id UUID,
  tutor_id UUID,
  subject_id UUID,
  date DATE,
  time TIME,
  duration INT DEFAULT 60,
  status TEXT DEFAULT 'upcoming'
) 
RETURNS JSONB AS $$
DECLARE
  new_lesson_id UUID;
  result JSONB;
BEGIN
  -- Insert the lesson
  INSERT INTO public.lessons (
    student_id, tutor_id, subject_id, date, time, duration, status
  )
  VALUES (
    student_id, tutor_id, subject_id, date, time, duration, status
  )
  RETURNING id INTO new_lesson_id;
  
  -- Build the result JSON
  SELECT jsonb_build_object(
    'id', l.id,
    'date', l.date,
    'time', l.time,
    'duration', l.duration,
    'status', l.status,
    'tutor', jsonb_build_object(
      'id', t.id,
      'first_name', t.first_name,
      'last_name', t.last_name
    ),
    'subject', jsonb_build_object(
      'name', s.name
    )
  )
  INTO result
  FROM public.lessons l
  JOIN public.profiles t ON l.tutor_id = t.id
  JOIN public.subjects s ON l.subject_id = s.id
  WHERE l.id = new_lesson_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
