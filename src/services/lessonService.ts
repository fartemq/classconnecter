
import { supabase } from "@/integrations/supabase/client";
import { Lesson, LessonData } from "@/types/lesson";
import { ensureObject } from "@/utils/supabaseUtils";

export const createLesson = async (lessonData: LessonData) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select(`
        id,
        subject:subjects (id, name)
      `);
      
    if (error) throw error;
    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};

export const fetchLessonsByDate = async (userId: string, date: string): Promise<Lesson[]> => {
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
        tutor:profiles!tutor_id (id, first_name, last_name),
        student:profiles!student_id (id, first_name, last_name, avatar_url),
        subject:subjects (id, name)
      `)
      .eq('date', date)
      .or(`tutor_id.eq.${userId},student_id.eq.${userId}`);
      
    if (error) throw error;
    
    // Map the database structure to our expected type, handling nested objects
    const lessons: Lesson[] = (data || []).map(item => ({
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
      tutor: item.tutor ? ensureObject({
        id: item.tutor.id,
        first_name: item.tutor.first_name,
        last_name: item.tutor.last_name,
        avatar_url: null
      }) : undefined,
      student: item.student ? ensureObject({
        id: item.student.id,
        first_name: item.student.first_name,
        last_name: item.student.last_name,
        avatar_url: item.student.avatar_url
      }) : undefined,
      subject: item.subject ? ensureObject({
        id: item.subject.id,
        name: item.subject.name
      }) : undefined
    }));
    
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};
