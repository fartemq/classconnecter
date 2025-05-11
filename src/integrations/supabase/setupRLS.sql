
-- Это вспомогательный файл для SQL-миграции, его нужно будет выполнить через SQL-редактор в Supabase

-- Включить Row Level Security для таблицы tutor_profiles
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;

-- Создать политики для tutor_profiles
CREATE POLICY "Users can insert their own tutor profile"
ON public.tutor_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own tutor profile"
ON public.tutor_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own tutor profile"
ON public.tutor_profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Everyone can view published tutor profiles"
ON public.tutor_profiles
FOR SELECT
USING (is_published = true OR auth.uid() = id);

-- Включить Row Level Security для таблицы student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Создать политики для student_profiles
CREATE POLICY "Users can insert their own student profile"
ON public.student_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own student profile"
ON public.student_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own student profile"
ON public.student_profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Everyone can view student profiles"
ON public.student_profiles
FOR SELECT
USING (true);

-- Enable RLS for tutor_subjects table
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for tutor_subjects
CREATE POLICY "Users can insert their own subjects"
ON public.tutor_subjects
FOR INSERT
WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Users can update their own subjects"
ON public.tutor_subjects
FOR UPDATE
USING (auth.uid() = tutor_id);

CREATE POLICY "Users can delete their own subjects"
ON public.tutor_subjects
FOR DELETE
USING (auth.uid() = tutor_id);

CREATE POLICY "Everyone can view tutor subjects"
ON public.tutor_subjects
FOR SELECT
USING (true);
