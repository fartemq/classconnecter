
import { supabase } from "@/integrations/supabase/client";

export interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const generateTutorTimeSlots = async (
  tutorId: string,
  date: Date
): Promise<TimeSlot[]> => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc('generate_tutor_time_slots', {
      p_tutor_id: tutorId,
      p_date: formattedDate
    });

    if (error) {
      console.error('Error generating time slots:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in generateTutorTimeSlots:', error);
    return [];
  }
};

export const getTutorSchedule = async (tutorId: string) => {
  try {
    const { data, error } = await supabase
      .from('tutor_schedule')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tutor schedule:', error);
    return [];
  }
};

export const updateTutorSchedule = async (
  tutorId: string,
  scheduleData: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    lesson_duration?: number;
    break_duration?: number;
  }>
) => {
  try {
    // Удаляем существующее расписание
    await supabase
      .from('tutor_schedule')
      .delete()
      .eq('tutor_id', tutorId);

    // Вставляем новое расписание
    const { data, error } = await supabase
      .from('tutor_schedule')
      .insert(
        scheduleData.map(slot => ({
          tutor_id: tutorId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          lesson_duration: slot.lesson_duration || 60,
          break_duration: slot.break_duration || 15,
          is_available: true
        }))
      );

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating tutor schedule:', error);
    return { success: false, error };
  }
};
