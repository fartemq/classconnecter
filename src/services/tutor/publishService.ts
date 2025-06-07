
import { supabase } from "@/integrations/supabase/client";
import { validateTutorProfile } from "./validationService";

export const getTutorPublicationStatus = async (tutorId: string) => {
  try {
    console.log("Getting publication status for tutor:", tutorId);
    
    // Get tutor profile with all related data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        tutor_profiles(*)
      `)
      .eq('id', tutorId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Get tutor subjects
    const { data: tutorSubjects, error: subjectsError } = await supabase
      .from('tutor_subjects')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('is_active', true);

    if (subjectsError) {
      console.error("Error fetching subjects:", subjectsError);
    }

    // Combine profile data
    const tutorProfile = Array.isArray(profile.tutor_profiles) 
      ? profile.tutor_profiles[0] 
      : profile.tutor_profiles;

    const profileData = {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
      city: profile.city,
      avatar_url: profile.avatar_url,
      education_institution: tutorProfile?.education_institution,
      degree: tutorProfile?.degree,
      graduation_year: tutorProfile?.graduation_year,
      experience: tutorProfile?.experience,
      methodology: tutorProfile?.methodology,
      achievements: tutorProfile?.achievements,
      video_url: tutorProfile?.video_url,
      is_published: tutorProfile?.is_published || false,
      education_verified: tutorProfile?.education_verified || false,
      subjects: tutorSubjects || []
    };
    
    console.log("Profile data for validation:", profileData);
    
    // Validate profile with subjects
    const result = validateTutorProfile(profileData, tutorSubjects);
    
    console.log("Validation result:", result);
    
    return {
      isValid: result.isValid,
      missingFields: result.missingFields || [],
      warnings: result.warnings || [],
      isPublished: tutorProfile?.is_published || false
    };
  } catch (error) {
    console.error('Error getting tutor publication status:', error);
    return {
      isValid: false,
      missingFields: ['Ошибка загрузки профиля'],
      warnings: [],
      isPublished: false
    };
  }
};

export const publishTutorProfile = async (tutorId: string, isPublished: boolean) => {
  try {
    console.log(`${isPublished ? 'Publishing' : 'Unpublishing'} tutor profile:`, tutorId);
    
    const { error } = await supabase
      .from('tutor_profiles')
      .update({ is_published: isPublished })
      .eq('id', tutorId);

    if (error) {
      console.error('Error updating publication status:', error);
      throw error;
    }
    
    console.log('Publication status updated successfully');
    return true;
  } catch (error) {
    console.error('Error publishing tutor profile:', error);
    return false;
  }
};
