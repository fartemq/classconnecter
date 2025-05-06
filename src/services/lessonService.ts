
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    // Define parameter type for the RPC call
    type GetLessonsParams = {
      p_student_id: string;
      p_date: string;
    };
    
    // Use RPC function to fetch lessons for a specific date
    const { data, error } = await supabase
      .rpc<Lesson[]>('get_student_lessons_by_date', { 
        p_student_id: studentId,
        p_date: date
      } as GetLessonsParams);

    if (error) {
      throw error;
    }

    return data as Lesson[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const createLesson = async (lessonData: LessonData): Promise<{ data: Lesson | null, error: any }> => {
  try {
    // Use RPC function for lesson creation with proper type
    const { data, error } = await supabase
      .rpc<Lesson>('create_lesson', lessonData as any);

    return { data: data as Lesson, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
