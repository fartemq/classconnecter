
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BookingRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  date: Date;
  scheduleSlotId: string;
}

export const bookLesson = async (request: BookingRequest): Promise<{ success: boolean; error?: string; lessonId?: string }> => {
  try {
    const { studentId, tutorId, subjectId, date, scheduleSlotId } = request;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    console.log("Starting lesson booking process with relationship management");
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
    
    // Проверка слота в расписании репетитора
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
      .in('status', ['pending', 'confirmed', 'upcoming']);
      
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
    
    console.log("All validations passed, creating the lesson and relationship");
    
    // Создание занятия
    const startDateTime = `${formattedDate}T${slotData.start_time}`;
    const endDateTime = `${formattedDate}T${slotData.end_time}`;
    
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        subject_id: subjectId,
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'pending'
      })
      .select()
      .single();
    
    if (lessonError) {
      console.error("Error creating lesson:", lessonError);
      return { 
        success: false, 
        error: "Не удалось создать занятие: " + lessonError.message 
      };
    }
    
    // Проверяем существование связи студент-репетитор
    const { data: existingRelation, error: relationCheckError } = await supabase
      .from('student_tutor_relationships')
      .select('*')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (relationCheckError) {
      console.error('Error checking existing relation:', relationCheckError);
    }

    // Если связи нет, создаем новую со статусом pending
    if (!existingRelation) {
      const { error: relationError } = await supabase
        .from('student_tutor_relationships')
        .insert({
          student_id: studentId,
          tutor_id: tutorId,
          status: 'pending',
          start_date: new Date().toISOString()
        });

      if (relationError) {
        console.error('Error creating student-tutor relationship:', relationError);
        // Не останавливаем процесс, если не удалось создать связь
      } else {
        console.log("Student-tutor relationship created");
      }
    }
    
    console.log("Lesson and relationship created successfully:", lessonData);
    
    return { 
      success: true,
      lessonId: lessonData.id
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
    // Получаем данные урока
    const { data: lessonData, error: lessonFetchError } = await supabase
      .from('lessons')
      .select('student_id, tutor_id')
      .eq('id', lessonId)
      .single();
      
    if (lessonFetchError || !lessonData) {
      console.error("Error fetching lesson data:", lessonFetchError);
      return false;
    }
    
    // Подтверждаем урок
    const { error: confirmError } = await supabase
      .from('lessons')
      .update({ 
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);
      
    if (confirmError) {
      console.error("Error confirming lesson:", confirmError);
      return false;
    }
    
    // Обновляем связь студент-репетитор на "accepted" если она была "pending"
    const { error: relationError } = await supabase
      .from('student_tutor_relationships')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', lessonData.student_id)
      .eq('tutor_id', lessonData.tutor_id)
      .eq('status', 'pending');
      
    if (relationError) {
      console.error('Error updating student-tutor relationship:', relationError);
      // Не возвращаем false, так как урок уже подтвержден
    }
    
    console.log("Lesson confirmed and relationship updated");
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
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
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
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error completing lesson:", error);
    return false;
  }
};
