
import { supabase } from "@/integrations/supabase/client";

export interface HomeworkData {
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description: string;
  file_path: string | null;
  due_date: string;
  status?: string;
}

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
