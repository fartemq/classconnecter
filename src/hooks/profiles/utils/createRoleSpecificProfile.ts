
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a role-specific profile (student or tutor) for a user
 * This is used to create the additional profile tables beyond the basic profile
 */
export async function createRoleSpecificProfile(
  userId: string,
  role: "student" | "tutor"
): Promise<boolean> {
  try {
    console.log(`Creating role-specific profile for user ${userId} with role ${role}`);
    
    // Based on role, create either a student or tutor profile
    if (role === "student") {
      // Create a student profile
      const { error: studentError } = await supabase
        .from("student_profiles")
        .insert({
          id: userId,
          educational_level: "",
          subjects: [],
          learning_goals: "",
          preferred_format: [],
          school: "",
          grade: ""
        });
        
      if (studentError) {
        console.error("Error creating student profile:", studentError);
        toast({
          title: "Ошибка создания профиля",
          description: "Не удалось создать профиль ученика",
          variant: "destructive",
        });
        return false;
      }
    } else {
      // Create a tutor profile
      const { error: tutorError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: userId,
          education_institution: "",
          degree: "",
          experience: 0,
          methodology: "",
          achievements: "",
          video_url: "",
          is_published: false,
          education_verified: false
        });
        
      if (tutorError) {
        console.error("Error creating tutor profile:", tutorError);
        toast({
          title: "Ошибка создания профиля",
          description: "Не удалось создать профиль репетитора",
          variant: "destructive",
        });
        return false;
      }
    }
    
    console.log(`Role-specific profile for ${role} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error in createRoleSpecificProfile for ${role}:`, error);
    return false;
  }
}
