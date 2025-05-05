
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
      .single();
    
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
        video_url: values.videoUrl || ''
      });
      
      if (tutorProfileError) {
        throw tutorProfileError;
      }
    }
    
    return { success: true, avatarUrl: finalAvatarUrl };
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

/**
 * Fetch a tutor's profile data
 */
export const fetchTutorProfile = async (userId: string): Promise<TutorProfile> => {
  try {
    // Fetch basic profile information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    // Fetch tutor specific information
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (tutorProfileError) {
      throw tutorProfileError;
    }
    
    // Fetch tutor subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        *,
        subjects:subject_id (
          id, name
        )
      `)
      .eq("tutor_id", userId);
    
    if (subjectsError) {
      throw subjectsError;
    }
    
    const formattedSubjects = subjectsData.map(item => ({
      id: item.subject_id,
      name: item.subjects.name,
      hourlyRate: item.hourly_rate,
      experienceYears: item.experience_years,
      description: item.description
    }));
    
    return {
      id: profileData.id,
      firstName: profileData.first_name,
      lastName: profileData.last_name || "",
      bio: profileData.bio || "",
      city: profileData.city || "",
      avatarUrl: profileData.avatar_url,
      educationInstitution: tutorProfileData?.education_institution || "",
      degree: tutorProfileData?.degree || "",
      graduationYear: tutorProfileData?.graduation_year || null,
      educationVerified: tutorProfileData?.education_verified || false,
      methodology: tutorProfileData?.methodology || "",
      experience: tutorProfileData?.experience || 0,
      achievements: tutorProfileData?.achievements || "",
      videoUrl: tutorProfileData?.video_url || "",
      subjects: formattedSubjects,
      rating: 0, // In future these could come from database
      reviewsCount: 0,
      completedLessons: 0,
      activeStudents: 0
    };
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    throw error;
  }
};
