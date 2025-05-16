
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams } from "../types";

/**
 * Updates a student profile with the given data
 */
export async function updateStudentProfile(
  userId: string,
  profileData: ProfileUpdateParams
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

/**
 * Updates a tutor profile with the given data
 */
export async function updateTutorProfile(
  userId: string,
  profileData: ProfileUpdateParams
): Promise<boolean> {
  try {
    const tutorProfileData = {
      education_institution: profileData.education_institution,
      degree: profileData.degree,
      graduation_year: profileData.graduation_year,
      experience: profileData.experience,
      methodology: profileData.methodology,
      achievements: profileData.achievements,
      video_url: profileData.video_url
    };

    const { error } = await supabase
      .from("tutor_profiles")
      .update(tutorProfileData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating tutor profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateTutorProfile:", error);
    return false;
  }
}

/**
 * Updates the base profile information
 */
export async function updateBaseProfile(
  userId: string,
  profileData: ProfileUpdateParams
): Promise<boolean> {
  try {
    const baseProfileData = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      bio: profileData.bio,
      city: profileData.city,
      phone: profileData.phone,
      avatar_url: profileData.avatar_url,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("profiles")
      .update(baseProfileData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating base profile:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateBaseProfile:", error);
    return false;
  }
}
