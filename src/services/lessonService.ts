
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

interface GetStudentLessonsByDateParams {
  p_student_id: string;
  p_date: string;
}

interface CreateLessonParams extends Record<string, any> {
  // This will be filled with the LessonData properties
}

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    const { data, error } = await supabase.rpc<Lesson[], GetStudentLessonsByDateParams>(
      "get_student_lessons_by_date", 
      { 
        p_student_id: studentId,
        p_date: date
      }
    );

    if (error) {
      throw error;
    }

    return data as Lesson[] || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const createLesson = async (lessonData: LessonData): Promise<{ data: Lesson | null, error: any }> => {
  try {
    const { data, error } = await supabase.rpc<Lesson, CreateLessonParams>(
      "create_lesson", 
      lessonData as CreateLessonParams
    );

    return { data: data as Lesson, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
