
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    // Define parameter type for the RPC call
    type GetHomeworkParams = { 
      p_homework_id: string 
    };
    
    // Use RPC function to fetch homework by id
    // Using `any` as a workaround for the TypeScript constraints issue
    const { data, error } = await supabase
      .rpc<Homework, GetHomeworkParams>("get_homework_by_id", { 
        p_homework_id: homeworkId 
      }) as { data: Homework | null; error: any };

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
    // Define parameters type for create_homework RPC
    type CreateHomeworkParams = HomeworkData;
    
    // Using `any` as a workaround for the TypeScript constraints issue
    const { data, error } = await supabase
      .rpc<Homework, CreateHomeworkParams>("create_homework", homeworkData) as { data: Homework | null; error: any };

    return { data, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const updateHomework = async (homeworkId: string, updateData: Partial<HomeworkData>): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Define parameter type for the RPC call
    type UpdateHomeworkParams = { 
      p_homework_id: string;
      [key: string]: any;
    };
    
    // Use RPC function for homework update
    // Using `any` as a workaround for the TypeScript constraints issue
    const { data, error } = await supabase
      .rpc<Homework, UpdateHomeworkParams>("update_homework", { 
        p_homework_id: homeworkId,
        ...updateData 
      }) as { data: Homework | null; error: any };

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
