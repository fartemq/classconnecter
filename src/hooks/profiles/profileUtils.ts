
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Profile } from "./types";

/**
 * Creates a basic profile for a user if one doesn't exist
 */
export async function createBasicProfile(
  user: User, 
  defaultRole: string = "student"
): Promise<Profile | null> {
  try {
    console.log("Creating basic profile for user:", user.id);
    
    const { data: newProfileData, error: insertError } = await supabase
      .from("profiles")
      .insert([
        { 
          id: user.id, 
          role: defaultRole,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          created_at: new Date().toISOString()
        }
      ])
      .select("*")
      .single();
      
    if (insertError) {
      console.error("Error creating profile:", insertError);
      toast({
        title: "Ошибка профиля",
        description: "Не удалось создать базовый профиль",
        variant: "destructive",
      });
      return null;
    }
    
    if (newProfileData) {
      console.log("Created new profile:", newProfileData);
      return newProfileData as Profile;
    }
    
    return null;
  } catch (error) {
    console.error("Error in createBasicProfile:", error);
    return null;
  }
}

/**
 * Creates a role-specific profile for a user
 */
export async function createRoleSpecificProfile(userId: string, role: string): Promise<boolean> {
  try {
    if (role === 'tutor') {
      const { error: tutorProfileError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: userId,
          education_institution: "",
          degree: "",
          graduation_year: new Date().getFullYear(),
          experience: 0,
          is_published: false
        });
      
      if (tutorProfileError) {
        console.error("Error creating tutor profile:", tutorProfileError);
        return false;
      }
    } else {
      try {
        // First check if the student profile already exists
        const { data: existingProfile } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
          
        if (!existingProfile) {
          const { error: studentProfileError } = await supabase
            .from("student_profiles")
            .insert({
              id: userId,
              educational_level: "school",
              subjects: [],
              preferred_format: []
            });
          
          if (studentProfileError) {
            console.error("Error creating student profile:", studentProfileError);
            return false;
          }
        }
      } catch (error) {
        console.error("Error creating/checking student profile:", error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error creating role-specific profile:", error);
    return false;
  }
}

/**
 * Fetches tutor-specific profile data
 */
export async function fetchTutorProfileData(userId: string) {
  try {
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (tutorProfileError) {
      console.error("Error fetching tutor profile data:", tutorProfileError);
      return null;
    }
    
    return tutorProfileData;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
}

/**
 * Checks if a user's role matches the required role
 */
export function checkRoleMatch(
  profileData: any,
  requiredRole: string | undefined,
  navigate: Function,
  isMounted: boolean
): boolean {
  if (requiredRole && profileData && profileData.role !== requiredRole) {
    console.log(`User role (${profileData.role}) doesn't match required role (${requiredRole})`);
    if (isMounted) {
      toast({
        title: "Доступ запрещен",
        description: `Эта страница доступна только для ${requiredRole === "student" ? "студентов" : "репетиторов"}.`,
        variant: "destructive",
      });
      navigate("/");
    }
    return false;
  }
  return true;
}

/**
 * Updates a student profile with the given data
 */
export async function updateStudentProfile(
  userId: string,
  profileData: any
): Promise<boolean> {
  try {
    // First check if the student profile already exists
    const { data: existingProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    const studentData = {
      educational_level: profileData.educational_level,
      subjects: profileData.subjects || [],
      learning_goals: profileData.learning_goals,
      preferred_format: profileData.preferred_format || [],
      school: profileData.school,
      grade: profileData.grade,
      budget: profileData.budget
    };
    
    if (existingProfile) {
      // Update existing record
      const { error } = await supabase
        .from("student_profiles")
        .update(studentData)
        .eq("id", userId);
        
      if (error) {
        console.error("Error updating student profile:", error);
        return false;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from("student_profiles")
        .insert({ ...studentData, id: userId });
        
      if (error) {
        console.error("Error creating student profile:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateStudentProfile:", error);
    return false;
  }
}
