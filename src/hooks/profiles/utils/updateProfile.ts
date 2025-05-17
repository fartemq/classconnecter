
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
    console.log("Updating student profile for user", userId, "with data:", profileData);
    
    // First check if the student profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking if student profile exists:", checkError);
      return false;
    }

    // Prepare student data with all educational fields
    const studentData = {
      educational_level: profileData.educational_level,
      subjects: profileData.subjects || [],
      learning_goals: profileData.learning_goals || "",
      preferred_format: profileData.preferred_format || [],
      school: profileData.school || "",
      grade: profileData.grade || "",
      budget: profileData.budget
    };
    
    console.log("Student profile data to save:", studentData);
    
    if (existingProfile) {
      console.log("Updating existing student profile for user:", userId);
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
      console.log("Creating new student profile for user:", userId);
      // Create new record
      const { error } = await supabase
        .from("student_profiles")
        .insert({ ...studentData, id: userId });
        
      if (error) {
        console.error("Error creating student profile:", error);
        return false;
      }
    }
    
    console.log("Student profile updated successfully");
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
    console.log("Updating tutor profile for user", userId, "with data:", profileData);
    
    // First check if the tutor profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking if tutor profile exists:", checkError);
      return false;
    }

    // Prepare tutor profile data with education fields - ensure all education fields are handled
    const tutorProfileData = {
      education_institution: profileData.education_institution || "",
      degree: profileData.degree || "",
      graduation_year: profileData.graduation_year || null,
      experience: profileData.experience || 0,
      methodology: profileData.methodology || "",
      achievements: profileData.achievements || "",
      video_url: profileData.video_url || ""
    };
    
    console.log("Tutor profile data to save:", tutorProfileData);
    
    if (existingProfile) {
      console.log("Updating existing tutor profile for user:", userId);
      // Update existing record
      const { error } = await supabase
        .from("tutor_profiles")
        .update(tutorProfileData)
        .eq("id", userId);

      if (error) {
        console.error("Error updating tutor profile:", error);
        return false;
      }
    } else {
      console.log("Creating new tutor profile for user:", userId);
      // Create new record with default values for required fields
      const { error } = await supabase
        .from("tutor_profiles")
        .insert({ 
          ...tutorProfileData, 
          id: userId, 
          is_published: false,
          education_verified: false
        });
      
      if (error) {
        console.error("Error creating tutor profile:", error);
        return false;
      }
    }

    console.log("Tutor profile updated successfully");
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
    console.log("Updating base profile for user", userId, "with data:", profileData);
    
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

    console.log("Base profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateBaseProfile:", error);
    return false;
  }
}
