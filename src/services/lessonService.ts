
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

interface GetStudentLessonsByDateParams {
  p_student_id: string;
  p_date: string;
}

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    const { data, error } = await supabase.rpc<Lesson[]>(
      "get_student_lessons_by_date", 
      { 
        p_student_id: studentId,
        p_date: date
      } as GetStudentLessonsByDateParams
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
    const { data, error } = await supabase.rpc<Lesson>(
      "create_lesson", 
      lessonData as Record<string, any>
    );

    return { data: data as Lesson, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
