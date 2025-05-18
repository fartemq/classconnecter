
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a tutor has added schedule slots
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added schedule:", error);
    return false;
  }
};
