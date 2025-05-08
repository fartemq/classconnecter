
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const createHomework = async (homeworkData: HomeworkData) => {
  try {
    const { data, error } = await supabase.rpc(
      'create_homework',
      {
        tutor_id: homeworkData.tutor_id,
        student_id: homeworkData.student_id,
        subject_id: homeworkData.subject_id,
        title: homeworkData.title,
        description: homeworkData.description,
        file_path: homeworkData.file_path,
        due_date: homeworkData.due_date
      }
    );
    
    return { data, error };
  } catch (error) {
    console.error('Error creating homework:', error);
    return { data: null, error };
  }
};

export const fetchHomeworkById = async (homeworkId: string): Promise<{ data: Homework | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        subject:subjects (id, name),
        tutor:profiles!tutor_id (id, first_name, last_name),
        student:profiles!student_id (id, first_name, last_name)
      `)
      .eq('id', homeworkId)
      .single();
      
    if (error) {
      return { data: null, error };
    }
    
    return { 
      data: data as Homework, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching homework:', error);
    return { data: null, error };
  }
};

export const gradeHomework = async (homeworkId: string, grade: number, feedback: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('homework')
      .update({
        grade,
        feedback,
        status: 'graded'
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (error) {
    console.error('Error grading homework:', error);
    return false;
  }
};

export const submitHomeworkAnswer = async (homeworkId: string, answer: string, filePath: string | null): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('homework')
      .update({
        answer,
        answer_file_path: filePath,
        status: 'submitted'
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (error) {
    console.error('Error submitting homework answer:', error);
    return false;
  }
};
