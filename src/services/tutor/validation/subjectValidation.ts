
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true)
      .limit(1);
      
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added subjects:", error);
    return false;
  }
};
