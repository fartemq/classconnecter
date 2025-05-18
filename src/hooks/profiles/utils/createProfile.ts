
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a role-specific profile for a user
 */
export const createRoleSpecificProfile = async (
  userId: string,
  role: "student" | "tutor"
): Promise<boolean> => {
  try {
    console.log(`Creating new ${role} profile for user:`, userId);
    
    if (role === "student") {
      // Create default student profile
      const { error } = await supabase
        .from("student_profiles")
        .insert({
          id: userId,
          educational_level: "school",
          subjects: [],
          preferred_format: [],
        });
      
      if (error) {
        console.error("Error creating student profile:", error);
        return false;
      }
      
      console.log("Student profile created successfully");
      return true;
      
    } else if (role === "tutor") {
      // Create default tutor profile
      const { error } = await supabase
        .from("tutor_profiles")
        .insert({
          id: userId,
          is_published: false,
          education_verified: false,
          experience: 0
        });
      
      if (error) {
        console.error("Error creating tutor profile:", error);
        return false;
      }
      
      console.log("Tutor profile created successfully");
      return true;
    }
    
    console.error("Invalid role specified:", role);
    return false;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    return false;
  }
};
