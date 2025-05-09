import { supabase } from "@/integrations/supabase/client";
import { Lesson } from "@/types/lesson";
import { format } from "date-fns";
import { ensureObject, ensureSingleObject } from "@/utils/supabaseUtils";

export interface LessonRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
}

export const fetchStudentLessons = async (studentId: string): Promise<Lesson[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        updated_at,
        tutor:profiles!tutor_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform the data to match our Lesson type
    const lessons: Lesson[] = data.map(item => {
      const tutor = item.tutor ? ensureSingleObject(item.tutor) : undefined;
      const subject = item.subject ? ensureSingleObject(item.subject) : undefined;
      
      return {
        id: item.id,
        tutor_id: item.tutor_id,
        student_id: item.student_id,
        subject_id: item.subject_id,
        date: item.date,
        time: item.time,
        duration: item.duration,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        tutor: tutor ? {
          id: tutor.id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          avatar_url: tutor.avatar_url
        } : undefined,
        subject: subject ? {
          id: subject.id,
          name: subject.name
        } : undefined
      };
    });
    
    return lessons;
  } catch (error) {
    console.error("Error fetching student lessons:", error);
    return [];
  }
};

export const fetchTutorLessons = async (tutorId: string): Promise<Lesson[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        updated_at,
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq('tutor_id', tutorId)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform the data to match our Lesson type
    const lessons: Lesson[] = data.map(item => {
      const student = item.student ? ensureSingleObject(item.student) : undefined;
      const subject = item.subject ? ensureSingleObject(item.subject) : undefined;
      
      return {
        id: item.id,
        tutor_id: item.tutor_id,
        student_id: item.student_id,
        subject_id: item.subject_id,
        date: item.date,
        time: item.time,
        duration: item.duration,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        student: student ? {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          avatar_url: student.avatar_url
        } : undefined,
        subject: subject ? {
          id: subject.id,
          name: subject.name
        } : undefined
      };
    });
    
    return lessons;
  } catch (error) {
    console.error("Error fetching tutor lessons:", error);
    return [];
  }
};

export const fetchLessonsByDate = async (userId: string, date: Date, role: 'student' | 'tutor'): Promise<Lesson[]> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const fieldName = role === 'student' ? 'student_id' : 'tutor_id';
    
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        updated_at,
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        tutor:profiles!tutor_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq(fieldName, userId)
      .eq('date', formattedDate);
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Transform the data to match our Lesson type
    const lessons: Lesson[] = data.map(item => {
      const student = item.student ? ensureSingleObject(item.student) : undefined;
      const tutor = item.tutor ? ensureSingleObject(item.tutor) : undefined;
      const subject = item.subject ? ensureSingleObject(item.subject) : undefined;
      
      return {
        id: item.id,
        tutor_id: item.tutor_id,
        student_id: item.student_id,
        subject_id: item.subject_id,
        date: item.date,
        time: item.time,
        duration: item.duration,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        student: student ? {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          avatar_url: student.avatar_url
        } : undefined,
        tutor: tutor ? {
          id: tutor.id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          avatar_url: tutor.avatar_url
        } : undefined,
        subject: subject ? {
          id: subject.id,
          name: subject.name
        } : undefined
      };
    });
    
    return lessons;
  } catch (error) {
    console.error("Error fetching lessons by date:", error);
    return [];
  }
};

export const bookLesson = async (request: LessonRequest): Promise<{ success: boolean; error?: string; lessonId?: string }> => {
  try {
    const { studentId, tutorId, subjectId, date, startTime, endTime, duration } = request;
    
    // Format the date as ISO string (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Create the lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        subject_id: subjectId,
        date: formattedDate,
        time: startTime,
        duration: duration,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      success: true,
      lessonId: data?.id
    };
  } catch (error) {
    console.error("Error booking lesson:", error);
    return { 
      success: false, 
      error: "Произошла ошибка при бронировании занятия" 
    };
  }
};

export const updateLessonStatus = async (
  lessonId: string, 
  status: 'confirmed' | 'canceled' | 'completed'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ status })
      .eq('id', lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating lesson status to ${status}:`, error);
    return false;
  }
};

export const getLessonDetails = async (lessonId: string): Promise<Lesson | null> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        id,
        tutor_id,
        student_id,
        subject_id,
        date,
        time,
        duration,
        status,
        created_at,
        updated_at,
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        tutor:profiles!tutor_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq('id', lessonId)
      .single();
      
    if (error) throw error;
    
    if (!data) return null;
    
    const student = data.student ? ensureSingleObject(data.student) : undefined;
    const tutor = data.tutor ? ensureSingleObject(data.tutor) : undefined;
    const subject = data.subject ? ensureSingleObject(data.subject) : undefined;
    
    return {
      id: data.id,
      tutor_id: data.tutor_id,
      student_id: data.student_id,
      subject_id: data.subject_id,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      student: student ? {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        avatar_url: student.avatar_url
      } : undefined,
      tutor: tutor ? {
        id: tutor.id,
        first_name: tutor.first_name,
        last_name: tutor.last_name,
        avatar_url: tutor.avatar_url
      } : undefined,
      subject: subject ? {
        id: subject.id,
        name: subject.name
      } : undefined
    };
  } catch (error) {
    console.error("Error getting lesson details:", error);
    return null;
  }
};
