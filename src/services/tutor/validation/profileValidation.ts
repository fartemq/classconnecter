
import { supabase } from "@/integrations/supabase/client";

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
