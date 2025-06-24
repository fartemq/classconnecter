
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const createHomework = async (homeworkData: HomeworkData) => {
  try {
    const { data, error } = await supabase.rpc(
      'create_homework_assignment',
      {
        p_tutor_id: homeworkData.tutor_id,
        p_student_id: homeworkData.student_id,
        p_subject_id: homeworkData.subject_id,
        p_title: homeworkData.title,
        p_description: homeworkData.description,
        p_due_date: homeworkData.due_date,
        p_materials: homeworkData.materials || []
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
        status: 'graded',
        updated_at: new Date().toISOString()
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (error) {
    console.error('Error grading homework:', error);
    return false;
  }
};

export const submitHomework = async (homeworkId: string, answer: string, answerFiles: string[] = []): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('homework')
      .update({
        answer,
        answer_files: answerFiles,
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (error) {
    console.error('Error submitting homework:', error);
    return false;
  }
};

export const fetchHomeworkForStudent = async (studentId: string): Promise<Homework[]> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        subject:subjects (id, name),
        tutor:profiles!tutor_id (id, first_name, last_name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as Homework[];
  } catch (error) {
    console.error('Error fetching student homework:', error);
    return [];
  }
};

export const fetchHomeworkForTutor = async (tutorId: string): Promise<Homework[]> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        subject:subjects (id, name),
        student:profiles!student_id (id, first_name, last_name)
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as Homework[];
  } catch (error) {
    console.error('Error fetching tutor homework:', error);
    return [];
  }
};
