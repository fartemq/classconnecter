
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added subjects:", error);
    return false;
  }
};

/**
 * Check if a tutor has added any schedule slots
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added schedule:", error);
    return false;
  }
};

/**
 * Validate tutor profile for completeness
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
      
    if (profileError) throw profileError;
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError) throw tutorError;
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) throw subjectsError;
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio || profileData.bio.length < 20) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData || !tutorData.degree) missingFields.push("Специальность");
    if (!tutorData || !tutorData.experience) missingFields.push("Опыт работы");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Check for warnings (recommended but not required)
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (!scheduleError && (!scheduleData || scheduleData.length === 0)) {
      warnings.push("Рекомендуется добавить расписание для повышения видимости в поиске");
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  } catch (error) {
    console.error("Error validating tutor profile:", error);
    return {
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: [],
    };
  }
};
