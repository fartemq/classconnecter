
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
    
    console.log("Booking lesson with formatted date:", formattedDate);
    console.log("Start time:", startTime);
    console.log("End time:", endTime);
    
    // Check if there are any exceptions for this date
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('tutor_schedule_exceptions')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', formattedDate)
      .eq('is_full_day', true);
      
    if (exceptionsError) {
      console.error("Error checking exceptions:", exceptionsError);
      return { 
        success: false, 
        error: "Не удалось проверить доступность репетитора" 
      };
    }
    
    if (exceptions && exceptions.length > 0) {
      return {
        success: false,
        error: "Репетитор недоступен в выбранную дату"
      };
    }
    
    // Get the day of week (1-7, where 1 is Monday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    
    // Check if the slot exists and is available
    const { data: slotData, error: slotError } = await supabase
      .from('tutor_schedule')
      .select('*')
      .eq('id', startTime)
      .eq('tutor_id', tutorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);
      
    if (slotError) {
      console.error("Error checking slot:", slotError);
      return { 
        success: false, 
        error: "Не удалось проверить доступность слота" 
      };
    }
    
    if (!slotData || slotData.length === 0) {
      return { 
        success: false, 
        error: "Выбранный слот недоступен" 
      };
    }
    
    // Check if there's already a lesson booked for this slot
    const { data: existingLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', formattedDate)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.eq.${startTime},end_time.eq.${endTime}`);
      
    if (lessonsError) {
      console.error("Error checking existing lessons:", lessonsError);
      return { 
        success: false, 
        error: "Не удалось проверить существующие занятия" 
      };
    }
    
    if (existingLessons && existingLessons.length > 0) {
      return { 
        success: false, 
        error: "Это время уже забронировано другим учеником" 
      };
    }
    
    // Create the lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        subject_id: subjectId,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        status: 'pending'
      })
      .select();
    
    if (error) {
      console.error("Error creating lesson:", error);
      return { 
        success: false, 
        error: "Не удалось создать занятие" 
      };
    }
    
    console.log("Lesson created successfully:", data);
    
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
      .update({ status: 'canceled' })
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
