
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

CREATE POLICY "Everyone can view tutor profiles"
ON public.tutor_profiles
FOR SELECT
USING (true);

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
