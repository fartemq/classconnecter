
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates tutor profile for completeness before publishing
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
      .single();
      
    if (tutorError) throw tutorError;
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (subjectsError) throw subjectsError;
    
    // Check schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (scheduleError) throw scheduleError;
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData.degree) missingFields.push("Специальность");
    if (!tutorData.experience) missingFields.push("Опыт работы");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Add warnings for recommended but not required fields
    if (!scheduleData || scheduleData.length === 0) {
      warnings.push("У вас не настроено расписание. Настройте расписание, чтобы ученики могли записываться к вам на занятия");
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  } catch (error) {
    console.error("Error checking profile completeness:", error);
    return {
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: [],
    };
  }
};

/**
 * Checks if a tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from("tutor_subjects")
      .select("id", { count: "exact", head: true })
      .eq("tutor_id", tutorId);
      
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking tutor subjects:", error);
    return false;
  }
};

/**
 * Checks if a tutor has added any schedule slots
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from("tutor_schedule")
      .select("id", { count: "exact", head: true })
      .eq("tutor_id", tutorId);
      
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking tutor schedule:", error);
    return false;
  }
};
