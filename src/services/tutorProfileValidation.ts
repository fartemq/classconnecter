
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates a tutor profile to check if it's ready for publication
 */
export const validateTutorProfile = async (tutorId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> => {
  try {
    // Check basic profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return {
        isValid: false,
        missingFields: ["Ошибка проверки профиля"],
        warnings: []
      };
    }
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor profile:", tutorError);
      return {
        isValid: false,
        missingFields: ["Ошибка проверки профиля"],
        warnings: []
      };
    }
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error checking tutor subjects:", subjectsError);
      return {
        isValid: false,
        missingFields: ["Ошибка проверки предметов"],
        warnings: []
      };
    }
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio || profileData.bio.length < 20) missingFields.push("О себе (мин. 20 символов)");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData || !tutorData.degree) missingFields.push("Специальность/степень");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения (минимум один)");
    }
    
    // Optional but recommended fields - warnings
    if (!tutorData || tutorData.experience === null) {
      warnings.push("Укажите опыт преподавания для улучшения профиля");
    }
    
    // Check if tutor has added a video presentation
    const { data: tutorVideoData, error: videoError } = await supabase
      .from("tutor_profiles")
      .select("video_url")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (!videoError && (!tutorVideoData || !tutorVideoData.video_url)) {
      warnings.push("Видео-презентация поможет привлечь больше студентов");
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  } catch (error) {
    console.error("Error validating tutor profile:", error);
    return {
      isValid: false,
      missingFields: ["Произошла ошибка при проверке профиля"],
      warnings: []
    };
  }
};

/**
 * Check if tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (error) {
      console.error("Error checking tutor subjects:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking tutor subjects:", error);
    return false;
  }
};

/**
 * Check if tutor has added schedule
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_available", true);
      
    if (error) {
      console.error("Error checking tutor schedule:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking tutor schedule:", error);
    return false;
  }
};
