
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export const useTutorSlots = (tutorId: string, date: Date) => {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    if (!tutorId || !date) return;
    
    setLoading(true);
    try {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Получаем расписание репетитора
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('tutor_schedule')
        .select('*')
        .eq('tutor_id', tutorId)
        .in('day_of_week', [dayOfWeek, dayOfWeek === 7 ? 0 : dayOfWeek])
        .eq('is_available', true);
        
      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
        setAvailableSlots([]);
        return;
      }
      
      if (!scheduleData || scheduleData.length === 0) {
        setAvailableSlots([]);
        return;
      }
      
      // Проверяем исключения
      const { data: exceptions, error: exceptionsError } = await supabase
        .from('tutor_schedule_exceptions')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('date', formattedDate)
        .eq('is_full_day', true);
        
      if (exceptionsError) {
        console.error('Error fetching exceptions:', exceptionsError);
      }
      
      if (exceptions && exceptions.length > 0) {
        setAvailableSlots([]);
        return;
      }
      
      // Получаем существующие занятия
      const { data: existingLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('tutor_id', tutorId)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lt('start_time', `${formattedDate}T23:59:59`)
        .in('status', ['pending', 'confirmed']);
        
      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }
      
      // Формируем доступные слоты
      const slots: AvailableSlot[] = scheduleData.map(slot => {
        const startDateTime = `${formattedDate}T${slot.start_time}`;
        const endDateTime = `${formattedDate}T${slot.end_time}`;
        
        const isBooked = existingLessons?.some(lesson => 
          lesson.start_time === startDateTime
        ) || false;
        
        return {
          id: slot.id,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isBooked
        };
      });
      
      setAvailableSlots(slots.filter(slot => !slot.isBooked));
    } catch (error) {
      console.error('Error in fetchSlots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [tutorId, date]);

  const refreshSlots = () => {
    fetchSlots();
  };

  return { availableSlots, loading, refreshSlots };
};
