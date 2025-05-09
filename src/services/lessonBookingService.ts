
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface BookingRequest {
  studentId: string;
  tutorId: string;
  subjectId: string;
  date: Date;
  startTime: string;
  endTime: string;
  message?: string;
}

export const bookLesson = async (request: BookingRequest): Promise<{
  success: boolean;
  lessonId?: string;
  error?: string;
}> => {
  try {
    // Format date as YYYY-MM-DD
    const formattedDate = format(request.date, "yyyy-MM-dd");
    
    // Check if the slot is available
    const { data: existingLessons, error: checkError } = await supabase
      .from("lessons")
      .select("*")
      .eq("tutor_id", request.tutorId)
      .eq("date", formattedDate)
      .eq("status", "confirmed")
      .or(`start_time.eq.${request.startTime},end_time.eq.${request.endTime}`);
      
    if (checkError) throw checkError;
    
    // If there's already a confirmed lesson at this time
    if (existingLessons && existingLessons.length > 0) {
      return {
        success: false,
        error: "Это время уже занято другим студентом"
      };
    }
    
    // Insert new lesson
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        tutor_id: request.tutorId,
        student_id: request.studentId,
        subject_id: request.subjectId,
        date: formattedDate,
        start_time: request.startTime,
        end_time: request.endTime,
        status: "pending", // Lessons start as pending until confirmed by tutor
        message: request.message || ""
      })
      .select();
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after lesson creation");
    }
    
    // Send notification to tutor
    await supabase
      .from("notifications")
      .insert({
        user_id: request.tutorId,
        type: "lesson_request",
        title: "Новый запрос на занятие",
        content: `Ученик запросил занятие ${formattedDate} в ${request.startTime}`,
        related_id: data[0].id,
        is_read: false
      });
    
    return {
      success: true,
      lessonId: data[0].id
    };
  } catch (error) {
    console.error("Error booking lesson:", error);
    return {
      success: false,
      error: "Не удалось забронировать занятие"
    };
  }
};

export const getTutorBookings = async (tutorId: string, startDate: Date, endDate: Date): Promise<any[]> => {
  try {
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        id,
        date,
        start_time,
        end_time,
        status,
        student:profiles!student_id (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        subject:subjects (
          id,
          name
        )
      `)
      .eq("tutor_id", tutorId)
      .gte("date", formattedStartDate)
      .lte("date", formattedEndDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting tutor bookings:", error);
    return [];
  }
};

export const getStudentBookings = async (studentId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        id,
        date,
        start_time,
        end_time,
        status,
        tutor:profiles!tutor_id (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        subject:subjects (
          id,
          name
        )
      `)
      .eq("student_id", studentId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error getting student bookings:", error);
    return [];
  }
};

export const updateLessonStatus = async (lessonId: string, status: 'confirmed' | 'canceled' | 'completed'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("lessons")
      .update({ status })
      .eq("id", lessonId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating lesson status:", error);
    return false;
  }
};
