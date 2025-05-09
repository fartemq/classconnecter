
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BookingRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export const bookLesson = async (request: BookingRequest): Promise<{ success: boolean; error?: string }> => {
  try {
    const { studentId, tutorId, subjectId, date, startTime, endTime } = request;
    
    // Format the date as ISO string (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if the slot is still available
    const { data: availableSlot, error: slotError } = await supabase
      .from('tutor_schedule')
      .select('*')
      .eq('id', startTime)
      .eq('tutor_id', tutorId)
      .eq('is_available', true)
      .single();
      
    if (slotError || !availableSlot) {
      return { 
        success: false, 
        error: "Выбранный слот недоступен или уже занят" 
      };
    }
    
    // Check if there are any exceptions for this date
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('tutor_schedule_exceptions')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', formattedDate)
      .eq('is_full_day', true);
      
    if (exceptionsError) throw exceptionsError;
    
    if (exceptions && exceptions.length > 0) {
      return {
        success: false,
        error: "Репетитор недоступен в выбранную дату"
      };
    }
    
    // Create the lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        subject_id: subjectId,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error booking lesson:", error);
    return { 
      success: false, 
      error: "Произошла ошибка при бронировании занятия" 
    };
  }
};

export const confirmLesson = async (lessonId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ status: 'confirmed' })
      .eq('id', lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error confirming lesson:", error);
    return false;
  }
};

export const cancelLesson = async (lessonId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ status: 'cancelled' })
      .eq('id', lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error cancelling lesson:", error);
    return false;
  }
};

export const completeLesson = async (lessonId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ status: 'completed' })
      .eq('id', lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error completing lesson:", error);
    return false;
  }
};
