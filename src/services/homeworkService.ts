
import { supabase } from "@/integrations/supabase/client";
import { Homework, HomeworkData } from "@/types/homework";

export const createHomework = async (homework: HomeworkData) => {
  try {
    const { data, error } = await supabase.rpc('create_homework', {
      tutor_id: homework.tutor_id,
      student_id: homework.student_id,
      subject_id: homework.subject_id,
      title: homework.title,
      description: homework.description,
      file_path: homework.file_path || null,
      due_date: homework.due_date
    });
    
    return { data, error };
  } catch (err) {
    console.error("Error in createHomework:", err);
    return { data: null, error: err };
  }
};

export const fetchHomeworkById = async (homeworkId: string): Promise<{ data: Homework | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        subject:subject_id(*),
        tutor:tutor_id(first_name, last_name),
        student:student_id(first_name, last_name)
      `)
      .eq('id', homeworkId)
      .single();
      
    return { 
      data: data as Homework | null,
      error 
    };
  } catch (err) {
    console.error("Error in fetchHomeworkById:", err);
    return { data: null, error: err };
  }
};

export const submitHomeworkAnswer = async (
  homeworkId: string, 
  answer: string | null, 
  answerFilePath: string | null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('homework')
      .update({ 
        status: 'submitted',
        answer,
        answer_file_path: answerFilePath
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (err) {
    console.error("Error in submitHomeworkAnswer:", err);
    return false;
  }
};

export const gradeHomework = async (
  homeworkId: string,
  grade: number,
  feedback: string | null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('homework')
      .update({ 
        status: 'graded',
        grade,
        feedback 
      })
      .eq('id', homeworkId);
      
    return !error;
  } catch (err) {
    console.error("Error in gradeHomework:", err);
    return false;
  }
};

export const fetchHomeworkAssignments = async (tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subject_id(name), student:student_id(first_name, last_name)')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });
      
    return { data: data || [], error };
  } catch (err) {
    console.error("Error in fetchHomeworkAssignments:", err);
    return { data: [], error: err };
  }
};

export const fetchStudentHomework = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subject_id(name), tutor:tutor_id(first_name, last_name)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    return { data: data || [], error };
  } catch (err) {
    console.error("Error in fetchStudentHomework:", err);
    return { data: [], error: err };
  }
};
