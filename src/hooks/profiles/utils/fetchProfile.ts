
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches student-specific profile data
 */
export const fetchStudentProfileData = async (userId: string) => {
  try {
    console.log("Fetching student profile data for user:", userId);
    
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching student profile data:", error);
      return null;
    }
    
    console.log("Student profile data:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchStudentProfileData:", error);
    return null;
  }
};

/**
 * Fetches tutor-specific profile data
 */
export const fetchTutorProfileData = async (userId: string) => {
  try {
    console.log("Fetching tutor profile data for user:", userId);
    
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching tutor profile data:", error);
      return null;
    }
    
    console.log("Tutor profile data:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
};
