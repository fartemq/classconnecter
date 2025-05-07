
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const fetchTutorSlots = useCallback(async () => {
    if (!tutorId || !date) return;
    
    try {
      setLoading(true);
      
      // Get day of week (1-7, where 1 is Monday)
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      
      const { data, error } = await supabase
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
        
      if (error) throw error;
      
      if (data) {
        setAvailableSlots(data.map(slot => ({
          id: slot.id,
          tutorId: slot.tutor_id,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isAvailable: slot.is_available
        })));
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching tutor slots:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить доступное время репетитора.",
        variant: "destructive"
      });
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
    refreshSlots: fetchTutorSlots
  };
};
