
import { supabase } from "@/integrations/supabase/client";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { uploadAvatar } from "./tutorStorageService";
import { ensureObject, ensureSingleObject } from "@/utils/supabaseUtils";

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
    console.log("Saving tutor profile for user:", userId);
    
    // Upload avatar if selected
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      console.log("Uploading avatar file");
      finalAvatarUrl = await uploadAvatar(avatarFile, userId);
      console.log("Avatar uploaded, URL:", finalAvatarUrl);
    }
    
    // Update profile in the database
    console.log("Updating basic profile");
    const { error: profileError } = await supabase.from("profiles").update({
      first_name: values.firstName,
      last_name: values.lastName,
      bio: values.bio,
      city: values.city,
      avatar_url: finalAvatarUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    
    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }
    
    // Check if tutor_profiles exists
    console.log("Checking existing tutor profile");
    const { data: existingTutorProfile, error: checkError } = await supabase
      .from("tutor_profiles")
      .select()
      .eq("id", userId)
      .maybeSingle();
    
    console.log("Tutor profile exists check:", existingTutorProfile, checkError);
    
    if (existingTutorProfile) {
      // Update existing record
      console.log("Updating existing tutor profile");
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").update({
        education_institution: values.educationInstitution || '',
        degree: values.degree || '',
        graduation_year: values.graduationYear || new Date().getFullYear(),
        methodology: values.methodology || '',
        experience: values.experience || 0,
        achievements: values.achievements || '',
        video_url: values.videoUrl || '',
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      
      if (tutorProfileError) {
        console.error("Error updating tutor profile:", tutorProfileError);
        throw tutorProfileError;
      }
    } else {
      // Create new record
      console.log("Creating new tutor profile");
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
        console.error("Error creating tutor profile:", tutorProfileError);
        throw tutorProfileError;
      }
    }
    
    console.log("Profile saved successfully");
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
    console.log("Publishing tutor profile for:", tutorId, "Status:", isPublished);
    
    const { error } = await supabase
      .from("tutor_profiles")
      .update({
        is_published: isPublished,
        updated_at: new Date().toISOString()
      })
      .eq("id", tutorId);
      
    if (error) {
      console.error("Error publishing tutor profile:", error);
      throw error;
    }
    
    console.log("Profile publish status updated successfully");
    return true;
  } catch (error) {
    console.error("Error publishing tutor profile:", error);
    return false;
  }
};

/**
 * Fetch a tutor's profile information
 */
export const fetchTutorProfile = async (tutorId: string): Promise<TutorProfile | null> => {
  try {
    console.log("Fetching tutor profile for:", tutorId);
    
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
    
    console.log("Base profile fetched:", profileData);
    
    // Fetch tutor-specific data
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor-specific data:", tutorError);
    }
    
    console.log("Tutor-specific data fetched:", tutorData);
    
    // If no tutor profile exists yet, create minimal data
    const tutorProfile = tutorData || {
      education_institution: "",
      degree: "",
      graduation_year: new Date().getFullYear(),
      is_published: false,
      education_verified: false
    };
    
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
    
    console.log("Tutor subjects fetched:", subjectsData);
    
    // Transform subjects data to match TutorSubject type
    const subjects = subjectsData?.map(item => {
      const subject = item.subjects ? ensureSingleObject(item.subjects) : { name: "" };
      return {
        id: item.id,
        name: subject?.name || "",
        hourlyRate: item.hourly_rate || 0,
        experienceYears: item.experience_years || undefined,
        description: item.description || undefined
      };
    }) || [];
    
    // Combine data and map to TutorProfile type
    return {
      id: profileData.id,
      firstName: profileData.first_name || "",
      lastName: profileData.last_name || "",
      bio: profileData.bio || "",
      city: profileData.city || "",
      avatarUrl: profileData.avatar_url || undefined,
      educationInstitution: tutorProfile.education_institution || "",
      degree: tutorProfile.degree || "",
      graduationYear: tutorProfile.graduation_year || new Date().getFullYear(),
      educationVerified: tutorProfile.education_verified || false,
      methodology: tutorProfile.methodology || undefined,
      experience: tutorProfile.experience || undefined,
      achievements: tutorProfile.achievements || undefined,
      videoUrl: tutorProfile.video_url || undefined,
      subjects: subjects,
      isPublished: tutorProfile.is_published || false
    };
  } catch (error) {
    console.error("Error in fetchTutorProfile:", error);
    return null;
  }
};

/**
 * Get the name of a subject
 */
export const getSubjectName = async (subjectId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", subjectId)
      .single();
      
    if (error) throw error;
    
    // Return the name if data exists
    return data ? data.name : "";
  } catch (error) {
    console.error("Error getting subject name:", error);
    return "";
  }
};

/**
 * Check if a tutor's profile is complete and ready for publication
 */
export const checkProfileCompleteness = async (tutorId: string): Promise<{
  isComplete: boolean;
  missingFields: string[];
}> => {
  try {
    // Check basic profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) throw profileError;
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) throw subjectsError;
    
    const missingFields: string[] = [];
    
    // Check required fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData || !tutorData.degree) missingFields.push("Специальность");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields,
    };
  } catch (error) {
    console.error("Error checking profile completeness:", error);
    return {
      isComplete: false,
      missingFields: ["Ошибка проверки профиля"],
    };
  }
};
