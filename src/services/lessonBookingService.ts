
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

export const bookLesson = async (request: BookingRequest): Promise<{ success: boolean; error?: string; lessonId?: string }> => {
  try {
    const { studentId, tutorId, subjectId, date, startTime, endTime } = request;
    
    // Format the date as ISO string (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    console.log("Starting lesson booking process");
    console.log("Booking details:", { 
      studentId, 
      tutorId, 
      subjectId, 
      date: formattedDate, 
      startTime, 
      endTime 
    });
    
    // Validate inputs
    if (!studentId || !tutorId || !subjectId || !formattedDate || !startTime || !endTime) {
      return { 
        success: false, 
        error: "Не все обязательные поля заполнены" 
      };
    }
    
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
      console.log("Tutor has a full day exception on this date");
      return {
        success: false,
        error: "Репетитор недоступен в выбранную дату"
      };
    }
    
    // Get the day of week (1-7, where 1 is Monday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    
    console.log("Checking if the selected time slot exists and is available");
    
    // Check if the slot exists and is available
    const { data: slotData, error: slotError } = await supabase
      .from('tutor_schedule')
      .select('*')
      .eq('id', startTime) // Using ID from the slot
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
      console.log("Selected slot not found or not available");
      return { 
        success: false, 
        error: "Выбранный слот недоступен" 
      };
    }
    
    console.log("Checking for existing bookings at this time");
    
    // Check if there's already a lesson booked for this slot and date
    const { data: existingLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', formattedDate)
      .in('status', ['pending', 'confirmed']);
      
    if (lessonsError) {
      console.error("Error checking existing lessons:", lessonsError);
      return { 
        success: false, 
        error: "Не удалось проверить существующие занятия" 
      };
    }
    
    // Check for time conflicts
    if (existingLessons && existingLessons.length > 0) {
      const selectedSlot = slotData[0];
      const hasConflict = existingLessons.some(lesson => {
        // Check if time periods overlap
        return (
          (selectedSlot.start_time < lesson.end_time && 
           selectedSlot.end_time > lesson.start_time)
        );
      });
      
      if (hasConflict) {
        console.log("Time conflict detected with existing lesson");
        return { 
          success: false, 
          error: "Это время уже забронировано другим учеником" 
        };
      }
    }
    
    console.log("All checks passed, creating the lesson");
    
    // Create the lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        subject_id: subjectId,
        date: formattedDate,
        start_time: slotData[0].start_time,
        end_time: slotData[0].end_time,
        status: 'pending'
      })
      .select();
    
    if (error) {
      console.error("Error creating lesson:", error);
      return { 
        success: false, 
        error: "Не удалось создать занятие: " + error.message 
      };
    }
    
    console.log("Lesson created successfully:", data);
    
    return { 
      success: true,
      lessonId: data[0]?.id
    };
  } catch (error) {
    console.error("Unexpected error booking lesson:", error);
    return { 
      success: false, 
      error: "Произошла непредвиденная ошибка при бронировании занятия" 
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
