
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    // Use RPC function to fetch lessons for a specific date
    const { data, error } = await supabase
      .rpc('get_student_lessons_by_date', { 
        p_student_id: studentId,
        p_date: date
      } as any);

    if (error) {
      throw error;
    }

    return data as unknown as Lesson[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const createLesson = async (lessonData: LessonData): Promise<{ data: Lesson | null, error: any }> => {
  try {
    // Use RPC function for lesson creation
    const { data, error } = await supabase
      .rpc('create_lesson', lessonData as any);

    return { data: data as unknown as Lesson, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
