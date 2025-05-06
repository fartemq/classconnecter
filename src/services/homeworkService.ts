
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const fetchHomeworkById = async (homeworkId: string): Promise<Homework | null> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        title,
        description,
        file_path,
        due_date,
        created_at,
        updated_at,
        status,
        answer,
        answer_file_path,
        grade,
        feedback,
        tutor:profiles!tutor_id (first_name, last_name),
        student:profiles!student_id (first_name, last_name),
        subject:subjects (id, name)
      `)
      .eq('id', homeworkId)
      .single();

    if (error) {
      throw error;
    }

    return data as Homework | null;
  } catch (error) {
    console.error('Error fetching homework:', error);
    return null;
  }
};

export const createHomework = async (homeworkData: HomeworkData): Promise<{ data: Homework | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .insert(homeworkData)
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        title,
        description,
        file_path,
        due_date,
        created_at,
        updated_at,
        status,
        answer,
        answer_file_path,
        grade,
        feedback,
        tutor:profiles!tutor_id (first_name, last_name),
        student:profiles!student_id (first_name, last_name),
        subject:subjects (id, name)
      `)
      .single();

    return { data: data as Homework | null, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const updateHomework = async (homeworkId: string, updateData: Partial<HomeworkData>): Promise<{ data: Homework | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .update(updateData)
      .eq('id', homeworkId)
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        title,
        description,
        file_path,
        due_date,
        created_at,
        updated_at,
        status,
        answer,
        answer_file_path,
        grade,
        feedback,
        tutor:profiles!tutor_id (first_name, last_name),
        student:profiles!student_id (first_name, last_name),
        subject:subjects (id, name)
      `)
      .single();

    return { data: data as Homework | null, error };
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
