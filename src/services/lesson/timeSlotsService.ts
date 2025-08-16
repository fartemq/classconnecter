import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const generateTutorTimeSlots = async (tutorId: string, date: Date): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase.rpc('generate_tutor_time_slots', {
      p_tutor_id: tutorId,
      p_date: format(date, 'yyyy-MM-dd')
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error generating time slots:', error);
    throw error;
  }
};