
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateParams } from "../types";

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

    // Update the base profile first
    const baseProfileData = {
      first_name: profileData.first_name || null,
      last_name: profileData.last_name || null,
      bio: profileData.bio || null,
      city: profileData.city || null,
      phone: profileData.phone || null,
      avatar_url: profileData.avatar_url || null,
      updated_at: new Date().toISOString()
    };

    const { error: baseProfileError } = await supabase
      .from("profiles")
      .update(baseProfileData)
      .eq("id", userId);

    if (baseProfileError) {
      console.error("Error updating base profile:", baseProfileError);
      return false;
    }

    // Extract education-specific fields, ensuring they're never undefined
    const tutorProfileData = {
      education_institution: profileData.education_institution || null,
      degree: profileData.degree || null,
      graduation_year: profileData.graduation_year || null,
      experience: profileData.experience || 0,
      methodology: profileData.methodology || null,
      achievements: profileData.achievements || null,
      video_url: profileData.video_url || null
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
