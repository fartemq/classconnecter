
import { supabase } from "@/integrations/supabase/client";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { uploadAvatar } from "./tutorStorageService";
import { ensureObject } from "@/utils/supabaseUtils";

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
    
    // Fetch tutor subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        id,
        hourly_rate,
        experience_years,
        description,
        subject_id,
        subjects:subject_id (name)
      `)
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
      return null;
    }
    
    // Transform subjects data to match TutorSubject type
    const subjects = subjectsData.map(item => {
      const subject = ensureObject(item.subjects);
      return {
        id: item.id,
        name: subject.name || "",
        hourlyRate: item.hourly_rate,
        experienceYears: item.experience_years || undefined,
        description: item.description || undefined
      };
    });
    
    // Combine data and map to TutorProfile type
    return {
      id: profileData.id,
      firstName: profileData.first_name,
      lastName: profileData.last_name || "",
      bio: profileData.bio || "",
      city: profileData.city || "",
      avatarUrl: profileData.avatar_url || undefined,
      educationInstitution: tutorData.education_institution,
      degree: tutorData.degree,
      graduationYear: tutorData.graduation_year,
      educationVerified: tutorData.education_verified,
      methodology: tutorData.methodology || undefined,
      experience: tutorData.experience || undefined,
      achievements: tutorData.achievements || undefined,
      videoUrl: tutorData.video_url || undefined,
      subjects: subjects,
      isPublished: tutorData.is_published || false
    };
  } catch (error) {
    console.error("Error in fetchTutorProfile:", error);
    return null;
  }
};
