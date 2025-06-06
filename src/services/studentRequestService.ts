
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface StudentRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  updated_at: string;
  tutor?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export interface TutorStudentRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

/**
 * Send a request from student to tutor
 */
export const sendStudentRequest = async (
  tutorId: string,
  subjectId?: string,
  message?: string
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('student_requests')
      .insert({
        student_id: userData.user.id,
        tutor_id: tutorId,
        subject_id: subjectId || null,
        message: message || null
      });

    if (error) throw error;

    toast({
      title: "Запрос отправлен",
      description: "Ваш запрос отправлен репетитору",
    });
    return true;
  } catch (error) {
    console.error('Error sending student request:', error);
    toast({
      title: "Ошибка",
      description: "Не удалось отправить запрос",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Send a request from tutor to student
 */
export const sendTutorRequest = async (
  studentId: string,
  subjectId?: string,
  message?: string
): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('tutor_student_requests')
      .insert({
        tutor_id: userData.user.id,
        student_id: studentId,
        subject_id: subjectId || null,
        message: message || null
      });

    if (error) throw error;

    toast({
      title: "Запрос отправлен",
      description: "Ваш запрос отправлен студенту",
    });
    return true;
  } catch (error) {
    console.error('Error sending tutor request:', error);
    toast({
      title: "Ошибка",
      description: "Не удалось отправить запрос",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Get student requests (for tutors)
 */
export const getTutorStudentRequests = async (): Promise<StudentRequest[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from('student_requests')
      .select(`
        *,
        tutor:profiles!tutor_id (id, first_name, last_name, avatar_url, city),
        subject:subjects (id, name)
      `)
      .eq('tutor_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tutor student requests:', error);
    return [];
  }
};

/**
 * Get tutor requests (for students)
 */
export const getStudentTutorRequests = async (): Promise<TutorStudentRequest[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from('tutor_student_requests')
      .select(`
        *,
        student:profiles!student_id (id, first_name, last_name, avatar_url, city),
        subject:subjects (id, name)
      `)
      .eq('student_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student tutor requests:', error);
    return [];
  }
};

/**
 * Update request status (for both student and tutor requests)
 */
export const updateRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected',
  isStudentRequest: boolean = true
): Promise<boolean> => {
  try {
    const table = isStudentRequest ? 'student_requests' : 'tutor_student_requests';
    
    const { error } = await supabase
      .from(table)
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;

    toast({
      title: status === 'accepted' ? "Запрос принят" : "Запрос отклонен",
      description: status === 'accepted' 
        ? "Студент добавлен в ваш список учеников" 
        : "Запрос отклонен",
    });
    return true;
  } catch (error) {
    console.error('Error updating request status:', error);
    toast({
      title: "Ошибка",
      description: "Не удалось обновить статус запроса",
      variant: "destructive",
    });
    return false;
  }
};
