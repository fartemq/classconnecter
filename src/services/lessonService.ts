
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    // Instead of using RPC, let's use direct table access with proper joins
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        tutor:profiles!tutor_id (id, first_name, last_name),
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq('student_id', studentId)
      .eq('date', date);

    if (error) {
      throw error;
    }

    return (data as Lesson[]) || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const createLesson = async (lessonData: LessonData): Promise<{ data: Lesson | null, error: any }> => {
  try {
    // Insert directly into the lessons table
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        tutor:profiles!tutor_id (id, first_name, last_name),
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .single();

    return { 
      data: data as Lesson | null, 
      error 
    };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
