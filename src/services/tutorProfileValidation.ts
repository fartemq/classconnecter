
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates a tutor's profile for completeness
 */
export const validateTutorProfile = async (tutorId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> => {
  try {
    // Check basic profile information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) throw profileError;
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, graduation_year")
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
    const warnings: string[] = [];
    
    // Validate required fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData || !tutorData.degree) missingFields.push("Специальность/степень");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения (минимум один)");
    }
    
    // Check for recommended fields (warnings)
    if (!tutorData?.graduation_year) warnings.push("Год окончания обучения");
    
    // Check methodology
    const { data: methodData } = await supabase
      .from("tutor_profiles")
      .select("methodology, experience, video_url")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (!methodData?.methodology || methodData.methodology.trim() === "") {
      warnings.push("Методика преподавания");
    }
    
    if (!methodData?.experience) {
      warnings.push("Опыт преподавания");
    }
    
    // Check if schedule is added
    const { data: scheduleData } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (!scheduleData || scheduleData.length === 0) {
      warnings.push("Расписание занятий");
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

/**
 * Check if a tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true)
      .limit(1);
      
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added subjects:", error);
    return false;
  }
};

/**
 * Check if a tutor has added schedule slots
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added schedule:", error);
    return false;
  }
};
