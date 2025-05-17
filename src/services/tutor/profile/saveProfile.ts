
import { supabase } from "@/integrations/supabase/client";
import { TutorFormValues } from "@/types/tutor";
import { uploadAvatar } from "../../tutorStorageService";

/**
 * Save a tutor's profile information
 */
export const saveTutorProfile = async (
  values: TutorFormValues, 
  userId: string, 
  avatarFile: File | null, 
  avatarUrl: string | null
): Promise<{ success: boolean; avatarUrl: string | null; error?: any }> => {
  try {
    console.log("Saving tutor profile for user:", userId);
    console.log("Form values:", values);
    console.log("Avatar file provided:", !!avatarFile);
    
    // Upload avatar if selected
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      console.log("Uploading avatar file");
      try {
        finalAvatarUrl = await uploadAvatar(avatarFile, userId);
        console.log("Avatar uploaded, URL:", finalAvatarUrl);
      } catch (avatarError) {
        console.error("Error uploading avatar:", avatarError);
        // Continue with the rest of the profile update even if avatar upload fails
      }
    }
    
    // Update basic profile information in the profiles table
    console.log("Updating basic profile");
    const { error: profileError } = await supabase.from("profiles").update({
      first_name: values.firstName,
      last_name: values.lastName,
      bio: values.bio,
      city: values.city,
      avatar_url: finalAvatarUrl, // Use the URL of uploaded avatar
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    
    if (profileError) {
      console.error("Error updating profile:", profileError);
      return { success: false, avatarUrl: null, error: profileError };
    }
    
    // Check if tutor_profiles exists
    console.log("Checking existing tutor profile");
    const { data: existingTutorProfile, error: checkError } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    console.log("Tutor profile exists check:", existingTutorProfile, checkError);
    
    // Prepare tutor profile data with mapped education fields
    const tutorProfileData: any = {
      updated_at: new Date().toISOString(),
      education_institution: values.educationInstitution || null,
      degree: values.degree || null,
      graduation_year: values.graduationYear || null,
      methodology: values.methodology || null,
      experience: values.experience || 0,
      achievements: values.achievements || null,
      video_url: values.videoUrl || null
    };
    
    console.log("Tutor profile data for saving:", tutorProfileData);
    
    if (existingTutorProfile) {
      // Update existing record
      console.log("Updating existing tutor profile with data:", tutorProfileData);
      const { error: tutorProfileError } = await supabase
        .from("tutor_profiles")
        .update(tutorProfileData)
        .eq("id", userId);
      
      if (tutorProfileError) {
        console.error("Error updating tutor profile:", tutorProfileError);
        return { success: false, avatarUrl: finalAvatarUrl, error: tutorProfileError };
      }
    } else {
      // Create new record
      console.log("Creating new tutor profile");
      tutorProfileData.id = userId;
      tutorProfileData.is_published = false;
      tutorProfileData.education_verified = false;
      
      const { error: tutorProfileError } = await supabase
        .from("tutor_profiles")
        .insert(tutorProfileData);
      
      if (tutorProfileError) {
        console.error("Error creating tutor profile:", tutorProfileError);
        return { success: false, avatarUrl: finalAvatarUrl, error: tutorProfileError };
      }
    }
    
    console.log("Profile saved successfully");
    return { success: true, avatarUrl: finalAvatarUrl };
  } catch (error) {
    console.error("Error saving tutor profile:", error);
    return { success: false, avatarUrl: null, error };
  }
};
