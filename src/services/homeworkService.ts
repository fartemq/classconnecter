
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    // Use type assertions to avoid constraint errors
    const { data, error } = await supabase.rpc(
      "get_homework_by_id", 
      { 
        p_homework_id: homeworkId 
      }
    ) as { data: Homework | null, error: any };

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching homework:', error);
    return null;
  }
};

export const createHomework = async (homeworkData: HomeworkData): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Use type assertions to avoid constraint errors
    const { data, error } = await supabase.rpc(
      "create_homework", 
      homeworkData
    ) as { data: Homework | null, error: any };

    return { data, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const updateHomework = async (homeworkId: string, updateData: Partial<HomeworkData>): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Use type assertions to avoid constraint errors
    const { data, error } = await supabase.rpc(
      "update_homework", 
      { 
        p_homework_id: homeworkId,
        ...updateData 
      }
    ) as { data: Homework | null, error: any };

    return { data, error };
  } catch (error) {
    console.error('Error updating homework:', error);
    return { data: null, error };
  }
};

export const submitHomeworkAnswer = async (
  homeworkId: string, 
  answer: string | null, 
  answerFilePath: string | null
): Promise<{ data: Homework | null, error: any }> => {
  return updateHomework(homeworkId, {
    answer,
    answer_file_path: answerFilePath,
    status: 'submitted'
  });
};

export const gradeHomework = async (
  homeworkId: string,
  grade: number,
  feedback: string | null
): Promise<{ data: Homework | null, error: any }> => {
  return updateHomework(homeworkId, {
    grade,
    feedback,
    status: 'graded'
  });
};
