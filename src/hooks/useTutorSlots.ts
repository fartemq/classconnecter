
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  tutorName?: string;
}

export const useTutorSlots = (tutorId: string, date: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTutorSlots = useCallback(async () => {
    if (!tutorId || !date) {
      setAvailableSlots([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get day of week (1-7, where 1 is Monday)
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log(`Fetching slots for tutor ${tutorId} on ${formattedDate} (day of week: ${dayOfWeek})`);
      
      // Check for schedule exceptions first (full day unavailability)
      const { data: exceptions, error: exceptionsError } = await supabase
        .from('tutor_schedule_exceptions')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('date', formattedDate)
        .eq('is_full_day', true);
        
      if (exceptionsError) {
        console.error("Error checking schedule exceptions:", exceptionsError);
        throw new Error("Не удалось проверить исключения в расписании");
      }
      
      // If there's a full day exception, no slots are available
      if (exceptions && exceptions.length > 0) {
        console.log("Tutor has a full day exception on this date");
        setAvailableSlots([]);
        return;
      }
      
      // Get regular schedule for this day of week
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('tutor_schedule')
        .select(`
          id,
          tutor_id,
          day_of_week,
          start_time,
          end_time,
          is_available
        `)
        .eq('tutor_id', tutorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);
        
      if (scheduleError) {
        console.error("Error fetching tutor schedule:", scheduleError);
        throw new Error("Не удалось загрузить расписание репетитора");
      }
      
      if (!scheduleData || scheduleData.length === 0) {
        console.log("No schedule data found for this day");
        setAvailableSlots([]);
        return;
      }
      
      // Check for existing lessons on this date to filter out booked slots
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('date', formattedDate)
        .in('status', ['pending', 'confirmed']);
        
      if (lessonsError) {
        console.error("Error fetching lessons:", lessonsError);
        throw new Error("Не удалось проверить существующие занятия");
      }
      
      // Filter out time slots that overlap with existing lessons
      const availableTimeslots = scheduleData.filter(slot => {
        // No lessons, all slots available
        if (!lessonsData || lessonsData.length === 0) return true;
        
        // Check if this slot overlaps with any lesson
        return !lessonsData.some(lesson => {
          const slotStart = slot.start_time;
          const slotEnd = slot.end_time;
          const lessonStart = lesson.start_time;
          const lessonEnd = lesson.end_time;
          
          // Check for overlap
          return (slotStart < lessonEnd && slotEnd > lessonStart);
        });
      });
      
      console.log(`Found ${availableTimeslots.length} available slots`);
      
      // Map to our TimeSlot interface
      setAvailableSlots(availableTimeslots.map(slot => ({
        id: slot.id,
        tutorId: slot.tutor_id,
        dayOfWeek: slot.day_of_week,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available
      })));
      
    } catch (err) {
      console.error('Error fetching tutor slots:', err);
      setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке расписания");
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось загрузить доступное время репетитора",
        variant: "destructive"
      });
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, [tutorId, date, toast]);

  useEffect(() => {
    fetchTutorSlots();
  }, [fetchTutorSlots]);

  return {
    availableSlots,
    loading,
    error,
    refreshSlots: fetchTutorSlots
  };
};
