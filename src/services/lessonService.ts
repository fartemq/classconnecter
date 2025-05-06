
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";

export const fetchLessonsByDate = async (studentId: string, date: string): Promise<Lesson[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_student_lessons_by_date', {
        p_student_id: studentId,
        p_date: date
      })
      .select('*');

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
    const { data, error } = await supabase
      .rpc('create_lesson', lessonData)
      .select('*');

    return { data: data ? data[0] as Lesson : null, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
