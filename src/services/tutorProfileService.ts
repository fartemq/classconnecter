
import { supabase } from "@/integrations/supabase/client";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { uploadAvatar } from "./tutorStorageService";

/**
 * Save a tutor's profile information
 */
export const saveTutorProfile = async (
  values: TutorFormValues, 
  userId: string, 
  avatarFile: File | null, 
  avatarUrl: string | null
): Promise<{ success: boolean; avatarUrl: string | null }> => {
  try {
    // Upload avatar if selected
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      finalAvatarUrl = await uploadAvatar(avatarFile, userId);
    }
    
    // Update profile in the database
    const { error: profileError } = await supabase.from("profiles").update({
      first_name: values.firstName,
      last_name: values.lastName,
      bio: values.bio,
      city: values.city,
      avatar_url: finalAvatarUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    
    if (profileError) {
      throw profileError;
    }
    
    // Update or create tutor_profiles record
    const { data: existingTutorProfile } = await supabase
      .from("tutor_profiles")
      .select()
      .eq("id", userId)
      .maybeSingle();
    
    if (existingTutorProfile) {
      // Update existing record
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").update({
        education_institution: values.educationInstitution,
        degree: values.degree,
        graduation_year: values.graduationYear,
        methodology: values.methodology,
        experience: values.experience,
        achievements: values.achievements,
        video_url: values.videoUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      
      if (tutorProfileError) {
        throw tutorProfileError;
      }
    } else {
      // Create new record
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
        id: userId,
        education_institution: values.educationInstitution || '',
        degree: values.degree || '',
        graduation_year: values.graduationYear || new Date().getFullYear(),
        methodology: values.methodology || '',
        experience: values.experience || 0,
        achievements: values.achievements || '',
        video_url: values.videoUrl || '',
        is_published: false,
      });
      
      if (tutorProfileError) {
        throw tutorProfileError;
      }
    }
    
    return { success: true, avatarUrl: finalAvatarUrl };
  } catch (error) {
    console.error("Error saving tutor profile:", error);
    return { success: false, avatarUrl: null };
  }
};

/**
 * Publish or unpublish a tutor's profile
 */
export const publishTutorProfile = async (tutorId: string, isPublished: boolean): Promise<boolean> => {
  try {
    console.log(`Setting tutor ${tutorId} published status to: ${isPublished}`);
    
    const { error } = await supabase
      .from("tutor_profiles")
      .update({ 
        is_published: isPublished,
        updated_at: new Date().toISOString()
      })
      .eq("id", tutorId);
      
    if (error) {
      console.error("Error publishing tutor profile:", error);
      return false;
    }
    
    console.log(`Successfully updated tutor ${tutorId} publish status to ${isPublished}`);
    return true;
  } catch (error) {
    console.error("Error in publishTutorProfile:", error);
    return false;
  }
};

/**
 * Fetch a tutor's profile information
 */
export const fetchTutorProfile = async (tutorId: string): Promise<TutorProfile | null> => {
  try {
    // Fetch base profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", tutorId)
      .eq("role", "tutor")
      .single();
      
    if (profileError) {
      console.error("Error fetching tutor base profile:", profileError);
      return null;
    }
    
    // Fetch tutor-specific data
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .single();
      
    if (tutorError) {
      console.error("Error fetching tutor-specific data:", tutorError);
      return null;
    }
    
    return { ...profileData, ...tutorData } as TutorProfile;
  } catch (error) {
    console.error("Error in fetchTutorProfile:", error);
    return null;
  }
};
