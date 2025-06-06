
import { supabase } from "@/integrations/supabase/client";
import { validateTutorProfile } from "./validationService";

export const getTutorPublicationStatus = async (tutorId: string) => {
  try {
    // Get tutor profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        tutor_profiles(*)
      `)
      .eq('id', tutorId)
      .single();

    if (profileError) throw profileError;

    // Validate profile
    const profileData = {
      ...profile,
      ...profile.tutor_profiles?.[0]
    };
    
    const result = validateTutorProfile(profileData);
    
    return {
      isValid: result.isValid,
      missingFields: result.missingFields || [],
      warnings: result.warnings || [],
      isPublished: profile.tutor_profiles?.[0]?.is_published || false
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
    const { error } = await supabase
      .from('tutor_profiles')
      .update({ is_published: isPublished })
      .eq('id', tutorId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error publishing tutor profile:', error);
    return false;
  }
};
