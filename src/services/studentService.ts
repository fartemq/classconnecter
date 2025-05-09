
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/student";
import { ensureObject, ensureSingleObject } from "@/utils/supabaseUtils";

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
    
    // Transform the data to match our Student type
    const students: Student[] = (data || []).map(item => {
      // Ensure student_profiles is properly handled as a single object
      const studentProfile = ensureSingleObject(item.student_profiles);
      
      return {
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        avatar_url: item.avatar_url,
        city: item.city,
        student_profiles: studentProfile ? {
          educational_level: studentProfile.educational_level || null,
          subjects: studentProfile.subjects || [],
          learning_goals: studentProfile.learning_goals || null,
          preferred_format: studentProfile.preferred_format || [],
          school: studentProfile.school || null,
          grade: studentProfile.grade || null,
          budget: studentProfile.budget || null
        } : null,
        // Add compatibility fields
        subjects: studentProfile?.subjects || [],
        level: studentProfile?.educational_level || 'Не указан',
        grade: studentProfile?.grade || null,
        school: studentProfile?.school || null
      };
    });
    
    return students;
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
