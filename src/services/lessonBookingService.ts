
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BookingRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  date: Date;
  scheduleSlotId: string; // Обязательно используем ID слота из расписания
}

export const bookLesson = async (request: BookingRequest): Promise<{ success: boolean; error?: string; lessonId?: string }> => {
  try {
    const { studentId, tutorId, subjectId, date, scheduleSlotId } = request;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    console.log("Starting lesson booking process with schedule validation");
    console.log("Booking details:", { 
      studentId, 
      tutorId, 
      subjectId, 
      date: formattedDate, 
      scheduleSlotId 
    });
    
    // Валидация входных данных
    if (!studentId || !tutorId || !subjectId || !formattedDate || !scheduleSlotId) {
      return { 
        success: false, 
        error: "Не все обязательные поля заполнены" 
      };
    }
    
    // ОБЯЗАТЕЛЬНАЯ проверка: слот должен существовать в расписании репетитора
    const { data: slotData, error: slotError } = await supabase
      .from('tutor_schedule')
      .select('*')
      .eq('id', scheduleSlotId)
      .eq('tutor_id', tutorId)
      .eq('is_available', true)
      .single();
      
    if (slotError || !slotData) {
      console.error("Schedule slot validation failed:", slotError);
      return { 
        success: false, 
        error: "Выбранный слот отсутствует в расписании репетитора" 
      };
    }
    
    // Проверка дня недели
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    if (slotData.day_of_week !== dayOfWeek) {
      return {
        success: false,
        error: "Слот не соответствует выбранному дню недели"
      };
    }
    
    // Проверка исключений в расписании
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
    
    // Проверка существующих занятий в этот слот
    const { data: existingLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .gte('start_time', `${formattedDate}T${slotData.start_time}`)
      .lt('start_time', `${formattedDate}T${slotData.end_time}`)
      .in('status', ['pending', 'confirmed']);
      
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
    
    console.log("All validations passed, creating the lesson");
    
    // Создание занятия СТРОГО по расписанию
    const startDateTime = `${formattedDate}T${slotData.start_time}`;
    const endDateTime = `${formattedDate}T${slotData.end_time}`;
    
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        subject_id: subjectId,
        start_time: startDateTime,
        end_time: endDateTime,
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
    
    console.log("Lesson created successfully according to schedule:", data);
    
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
