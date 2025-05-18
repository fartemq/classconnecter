
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a role-specific profile (student or tutor) based on the specified role
 * 
 * @param userId The user's ID
 * @param role Either "student" or "tutor"
 */
export async function createRoleSpecificProfile(
  userId: string,
  role: "student" | "tutor"
): Promise<boolean> {
  try {
    console.log(`Creating ${role} profile for user ${userId}`);
    
    if (role === "student") {
      // Check if student profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if student profile exists:", checkError);
        return false;
      }
      
      // Only create if it doesn't exist
      if (!existingProfile) {
        const { error } = await supabase
          .from("student_profiles")
          .insert({
            id: userId,
            educational_level: null,
            subjects: [],
            learning_goals: null,
            preferred_format: [],
            school: null,
            grade: null,
            budget: null
          });
        
        if (error) {
          console.error("Error creating student profile:", error);
          return false;
        }
        
        console.log("Student profile created successfully");
      } else {
        console.log("Student profile already exists, not creating a new one");
      }
    } else if (role === "tutor") {
      // Check if tutor profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if tutor profile exists:", checkError);
        return false;
      }
      
      // Only create if it doesn't exist
      if (!existingProfile) {
        const { error } = await supabase
          .from("tutor_profiles")
          .insert({
            id: userId,
            education_institution: null,
            degree: null,
            graduation_year: null,
            experience: 0,
            methodology: null,
            achievements: null,
            video_url: null,
            is_published: false,
            education_verified: false
          });
        
        if (error) {
          console.error("Error creating tutor profile:", error);
          return false;
        }
        
        console.log("Tutor profile created successfully");
      } else {
        console.log("Tutor profile already exists, not creating a new one");
      }
    } else {
      console.error("Invalid role specified:", role);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    return false;
  }
}
