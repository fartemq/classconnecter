
-- Add Row Level Security for student_profiles table
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to create their own profile
CREATE POLICY "Users can create their own student profile" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own student profile" 
ON public.student_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own student profile" 
ON public.student_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own student profile" 
ON public.student_profiles 
FOR DELETE 
USING (auth.uid() = id);
