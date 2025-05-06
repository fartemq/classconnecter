import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

interface GetHomeworkByIdParams {
  p_homework_id: string;
}

interface CreateHomeworkParams extends Record<string, any> {
  // This will be filled with the HomeworkData properties
}

interface UpdateHomeworkParams extends Record<string, any> {
  p_homework_id: string;
  // Other optional parameters will be dynamically added
}

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    const { data, error } = await supabase.rpc(
      "get_homework_by_id", 
      { 
        p_homework_id: homeworkId 
      } as GetHomeworkByIdParams
    );

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
    const { data, error } = await supabase.rpc(
      "create_homework", 
      homeworkData as CreateHomeworkParams
    );

    return { data: data as Homework, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const updateHomework = async (homeworkId: string, updateData: Partial<HomeworkData>): Promise<{ data: Homework | null, error: any }> => {
  try {
    const params: UpdateHomeworkParams = {
      p_homework_id: homeworkId,
      ...updateData
    };

    const { data, error } = await supabase.rpc(
      "update_homework", 
      params
    );

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
