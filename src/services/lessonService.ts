
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    // Use type parameters to properly define the function return and params types
    const { data, error } = await supabase.rpc<Lesson[], { 
      p_student_id: string;
      p_date: string;
    }>(
      "get_student_lessons_by_date", 
      { 
        p_student_id: studentId,
        p_date: date
      }
    );

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
    // Use type parameters to properly define the function return and params types
    const { data, error } = await supabase.rpc<Lesson, LessonData>(
      "create_lesson", 
      lessonData
    );

    return { data, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
