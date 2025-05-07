
import { supabase } from "@/integrations/supabase/client";
import { Student } from "@/types/student";
import { createStudentFromProfile } from "@/utils/studentUtils";

// Получение всех доступных учеников (не являющихся учениками данного репетитора)
export const fetchAvailableStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    // Получаем всех студентов из таблицы profiles
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (profilesError) throw profilesError;
    if (!studentProfiles?.length) return [];
    
    // Получаем id студентов, которые уже связаны с этим репетитором
    const { data: existingRequests, error: requestsError } = await supabase
      .from('student_requests')
      .select('student_id')
      .eq('tutor_id', tutorId);
    
    if (requestsError) throw requestsError;
    
    // Создаем множество id существующих студентов
    const existingStudentIds = new Set(existingRequests?.map(req => req.student_id) || []);
    
    // Фильтруем только тех студентов, которые ещё не связаны с репетитором
    const availableStudentProfiles = studentProfiles.filter(profile => 
      !existingStudentIds.has(profile.id)
    );
    
    // Преобразуем профили в объекты типа Student
    const students: Student[] = await Promise.all(
      availableStudentProfiles.map(async (profile) => {
        // Дополнительно получаем данные из таблицы student_profiles
        const { data: studentProfile, error: studentProfileError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', profile.id)
          .single();
        
        if (studentProfileError && studentProfileError.code !== 'PGRST116') {
          console.error('Error fetching student profile:', studentProfileError);
        }
        
        return createStudentFromProfile(profile, studentProfile || null);
      })
    );
    
    return students;
  } catch (error) {
    console.error('Error fetching available students:', error);
    return [];
  }
};

// Получение учеников репетитора (которые приняли запрос)
export const fetchMyStudents = async (tutorId: string): Promise<Student[]> => {
  try {
    const { data: acceptedRequests, error: requestsError } = await supabase
      .from('student_requests')
      .select(`
        *,
        student:profiles!student_id(*)
      `)
      .eq('tutor_id', tutorId)
      .eq('status', 'accepted');
    
    if (requestsError) throw requestsError;
    if (!acceptedRequests?.length) return [];
    
    const students: Student[] = await Promise.all(
      acceptedRequests.map(async (request) => {
        const studentProfile = request.student;
        
        // Получаем дополнительные данные из таблицы student_profiles
        const { data: additionalData, error: profileError } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', studentProfile.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching student additional data:', profileError);
        }
        
        return createStudentFromProfile(studentProfile, additionalData || null);
      })
    );
    
    return students;
  } catch (error) {
    console.error('Error fetching my students:', error);
    return [];
  }
};

// Отправка запроса на подключение к студенту
export const sendRequestToStudent = async (
  tutorId: string, 
  studentId: string, 
  subjectId: string | null = null,
  message: string | null = null
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_requests')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        subject_id: subjectId,
        status: 'pending',
        message
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending request to student:', error);
    return false;
  }
};
