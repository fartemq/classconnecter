
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch general profile data for any user
 */
export const fetchProfileData = async (userId: string) => {
  try {
    console.log("Fetching general profile data for user:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        student_profiles (*),
        tutor_profiles (*)
      `)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }

    console.log("Profile data fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchProfileData:", error);
    return null;
  }
};

/**
 * Fetch tutor-specific profile data
 */
export const fetchTutorProfileData = async (userId: string) => {
  try {
    console.log("Fetching tutor profile data for user:", userId);
    
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching tutor profile:", error);
      throw error;
    }

    console.log("Tutor profile data fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
};

/**
 * Fetch student-specific profile data
 */
export const fetchStudentProfileData = async (userId: string) => {
  try {
    console.log("Fetching student profile data for user:", userId);
    
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }

    console.log("Student profile data fetched:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchStudentProfileData:", error);
    return null;
  }
};
