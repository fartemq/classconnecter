
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    // Define parameter type for the RPC call
    type GetHomeworkParams = { p_homework_id: string };
    
    // Use RPC function to fetch homework by id
    const { data, error } = await supabase
      .rpc<Homework>('get_homework_by_id', { 
        p_homework_id: homeworkId 
      } as GetHomeworkParams);

    if (error) {
      throw error;
    }

    return data as Homework;
  } catch (error) {
    console.error('Error fetching homework:', error);
    return null;
  }
};

export const createHomework = async (homeworkData: HomeworkData): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Use RPC function for homework creation with proper type
    const { data, error } = await supabase
      .rpc<Homework>('create_homework', homeworkData as any);

    return { data: data as Homework, error };
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
    const { data, error } = await supabase
      .rpc<Homework>('update_homework', { 
        p_homework_id: homeworkId,
        ...updateData 
      } as UpdateHomeworkParams);

    return { data: data as Homework, error };
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
