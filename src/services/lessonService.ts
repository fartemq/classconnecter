
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
    // Use type assertion to work around TypeScript constraints
    const { data, error } = await supabase.rpc(
      "get_student_lessons_by_date", 
      { 
        p_student_id: studentId,
        p_date: date
      }
    ) as unknown as { data: Lesson[] | null; error: any };

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const createLesson = async (lessonData: LessonData): Promise<{ data: Lesson | null, error: any }> => {
  try {
    // Use RPC function for lesson creation
    // Use type assertion to work around TypeScript constraints
    const { data, error } = await supabase.rpc(
      "create_lesson", 
      lessonData
    ) as unknown as { data: Lesson | null; error: any };

    return { data, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
