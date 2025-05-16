
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Profile } from "../types";

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
      return await createTutorProfile(userId);
    } else {
      return await createStudentProfile(userId);
    }
  } catch (error) {
    console.error("Error creating role-specific profile:", error);
    return false;
  }
}

/**
 * Creates a student-specific profile
 */
async function createStudentProfile(userId: string): Promise<boolean> {
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
    return true;
  } catch (error) {
    console.error("Error creating/checking student profile:", error);
    return false;
  }
}

/**
 * Creates a tutor-specific profile
 */
async function createTutorProfile(userId: string): Promise<boolean> {
  try {
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
    return true;
  } catch (error) {
    console.error("Error creating tutor profile:", error);
    return false;
  }
}
