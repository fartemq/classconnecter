-- Add missed fields to homework table for answer tracking
ALTER TABLE public.homework 
ADD COLUMN IF NOT EXISTS answer TEXT,
ADD COLUMN IF NOT EXISTS answer_file_path TEXT;

-- Create lesson_notes table for storing lesson notes
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Заметка',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for lesson_notes
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson_notes
CREATE POLICY "Users can create lesson notes for their lessons" 
ON public.lesson_notes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.lessons l 
    WHERE l.id = lesson_notes.lesson_id 
    AND (l.student_id = auth.uid() OR l.tutor_id = auth.uid())
  )
);

CREATE POLICY "Users can view lesson notes for their lessons" 
ON public.lesson_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l 
    WHERE l.id = lesson_notes.lesson_id 
    AND (l.student_id = auth.uid() OR l.tutor_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own lesson notes" 
ON public.lesson_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson notes" 
ON public.lesson_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update lesson_materials table to handle file uploads better
ALTER TABLE public.lesson_materials 
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create trigger for updated_at on lesson_notes
CREATE TRIGGER update_lesson_notes_updated_at
BEFORE UPDATE ON public.lesson_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();