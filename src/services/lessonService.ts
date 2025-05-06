
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
    // Using `any` as a workaround for the TypeScript constraints issue
    const { data, error } = await supabase
      .rpc<Lesson[], GetLessonsParams>("get_student_lessons_by_date", { 
        p_student_id: studentId,
        p_date: date
      }) as { data: Lesson[] | null; error: any };

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
    // Define parameters type for create_lesson RPC
    type CreateLessonParams = {
      student_id: string;
      tutor_id: string;
      subject_id: string;
      date: string;
      time: string;
      duration: number;
      status: string;
    };
    
    // Using `any` as a workaround for the TypeScript constraints issue
    const { data, error } = await supabase
      .rpc<Lesson, CreateLessonParams>("create_lesson", lessonData) as { data: Lesson | null; error: any };

    return { data, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};
