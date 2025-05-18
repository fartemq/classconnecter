
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches student profile data for a specific user
 */
export async function fetchStudentProfileData(userId: string) {
  try {
    console.log(`Fetching student profile data for user ${userId}`);
    
    const { data: studentData, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        // No data found, not necessarily an error
        console.log("No student profile found for user:", userId);
        return null;
      }
      
      console.error("Error fetching student profile data:", error);
      return null;
    }
    
    console.log("Student profile data fetched successfully:", studentData);
    return studentData;
  } catch (error) {
    console.error("Error in fetchStudentProfileData:", error);
    return null;
  }
}

/**
 * Fetches tutor profile data for a specific user
 */
export async function fetchTutorProfileData(userId: string) {
  try {
    console.log(`Fetching tutor profile data for user ${userId}`);
    
    const { data: tutorData, error } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") {
        // No data found, not necessarily an error
        console.log("No tutor profile found for user:", userId);
        return null;
      }
      
      console.error("Error fetching tutor profile data:", error);
      return null;
    }
    
    console.log("Tutor profile data fetched successfully:", tutorData);
    return tutorData;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
}
