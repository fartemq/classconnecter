
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    // Use raw query with explicit casting since the types don't know about the homework table yet
    const { data, error } = await supabase
      .rpc('get_homework_by_id', { homework_id: homeworkId });

    if (error) {
      throw error;
    }

    return data as unknown as Homework;
  } catch (error) {
    console.error('Error fetching homework:', error);
    return null;
  }
};

export const createHomework = async (homeworkData: HomeworkData): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Use raw query with explicit casting since the types don't know about the homework table yet
    const { data, error } = await supabase
      .rpc('create_homework', homeworkData);

    return { data: data as unknown as Homework, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const updateHomework = async (homeworkId: string, updateData: Partial<HomeworkData>): Promise<{ data: Homework | null, error: any }> => {
  try {
    // Use raw query with explicit casting since the types don't know about the homework table yet
    const { data, error } = await supabase
      .rpc('update_homework', { 
        homework_id: homeworkId,
        ...updateData 
      });

    return { data: data as unknown as Homework, error };
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
