
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/student";

export const fetchAvailableStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        first_name, 
        last_name, 
        avatar_url, 
        city,
        student_profiles!inner(*)
      `)
      .eq('role', 'student');
      
    if (error) {
      console.error("Error fetching available students:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Error in fetchAvailableStudents:", err);
    return [];
  }
};

export const fetchMyStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    // For now, just return an empty array as we haven't implemented this feature yet
    return [];
  } catch (err) {
    console.error("Error in fetchMyStudents:", err);
    return [];
  }
};

export const sendRequestToStudent = async (
  tutorId: string, 
  studentId: string, 
  subjectId: string | null = null,
  message: string | null = null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: tutorId,
        receiver_id: studentId,
        subject: 'Запрос на подключение',
        content: message || 'Здравствуйте! Я хотел бы стать вашим репетитором.'
      });
      
    return !error;
  } catch (err) {
    console.error("Error in sendRequestToStudent:", err);
    return false;
  }
};
