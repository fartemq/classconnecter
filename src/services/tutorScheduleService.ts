
import { supabase } from "@/integrations/supabase/client";
import { TimeSlot } from "@/types/tutor";

export interface ScheduleException {
  id: string;
  tutorId: string;
  date: string;
  reason: string;
  isFullDay: boolean;
}

// Fetch tutor's regular schedule
export const fetchTutorSchedule = async (tutorId: string): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("*")
      .eq("tutor_id", tutorId);
      
    if (error) throw error;
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      tutorId: item.tutor_id,
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isAvailable: item.is_available
    }));
  } catch (error) {
    console.error("Error fetching tutor schedule:", error);
    return [];
  }
};

// Check if tutor has available slots on a specific date
export const hasAvailableSlotsOnDate = async (tutorId: string, date: string): Promise<boolean> => {
  try {
    const dayOfWeek = new Date(date).getDay() || 7; // Convert to 1-7 where 1 is Monday
    
    // Check for exceptions first
    const { data: exceptionData, error: exceptionError } = await supabase
      .from("tutor_schedule_exceptions")
      .select("*")
      .eq("tutor_id", tutorId)
      .eq("date", date)
      .eq("is_full_day", true);
      
    if (exceptionError) throw exceptionError;
    
    // If there's a full day exception, the tutor is not available
    if (exceptionData && exceptionData.length > 0) {
      return false;
    }
    
    // Check regular schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("tutor_schedule")
      .select("*")
      .eq("tutor_id", tutorId)
      .in("day_of_week", ARRAY[dayOfWeek, CASE WHEN dayOfWeek = 7 THEN 0 ELSE dayOfWeek END])
      .eq("is_available", true);
      
    if (scheduleError) throw scheduleError;
    
    return scheduleData && scheduleData.length > 0;
  } catch (error) {
    console.error("Error checking available slots:", error);
    return false;
  }
};

// Get available time slots for a specific date
export const getAvailableSlotsForDate = async (tutorId: string, date: string): Promise<TimeSlot[]> => {
  try {
    const dayOfWeek = new Date(date).getDay() || 7; // Convert to 1-7 where 1 is Monday
    
    // Get regular schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("tutor_schedule")
      .select("*")
      .eq("tutor_id", tutorId)
      .in("day_of_week", ARRAY[dayOfWeek, CASE WHEN dayOfWeek = 7 THEN 0 ELSE dayOfWeek END])
      .eq("is_available", true);
      
    if (scheduleError) throw scheduleError;
    
    if (!scheduleData || scheduleData.length === 0) {
      return [];
    }
    
    // Check for exceptions and booked lessons on that date
    const { data: bookedData, error: bookedError } = await supabase
      .from("lessons")
      .select("start_time, end_time")
      .eq("tutor_id", tutorId)
      .gte("start_time", date || '')
      .lt("start_time", (date || '') || '')
      .in("status", ["confirmed", "pending"]);
      
    if (bookedError) throw bookedError;
    
    const bookedSlots = bookedData || [];
    
    // Filter out booked slots
    const availableSlots = scheduleData.filter(slot => {
      // Check if slot overlaps with any booked slot
      return !bookedSlots.some(booked => {
        return (slot.start_time < booked.end_time && slot.end_time > booked.start_time);
      });
    });
    
    return availableSlots.map(item => ({
      id: item.id,
      tutorId: item.tutor_id,
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isAvailable: item.is_available
    }));
  } catch (error) {
    console.error("Error getting available slots for date:", error);
    return [];
  }
};

// Add schedule exception
export const addScheduleException = async (
  tutorId: string, 
  date: string,
  reason: string,
  isFullDay: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tutor_schedule_exceptions")
      .insert({
        tutor_id: tutorId,
        date,
        reason,
        is_full_day: isFullDay
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error adding schedule exception:", error);
    return false;
  }
};
