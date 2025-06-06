
import { supabase } from "@/integrations/supabase/client";

export interface TutorValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * Validate tutor profile for publication
 */
export const validateTutorProfile = async (tutorId: string): Promise<TutorValidationResult> => {
  try {
    console.log("Validating tutor profile for ID:", tutorId);
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Fetch basic profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", tutorId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Не удалось загрузить профиль");
    }
    
    // Check required basic fields
    if (!profileData.first_name?.trim()) {
      missingFields.push("Имя");
    }
    if (!profileData.last_name?.trim()) {
      missingFields.push("Фамилия");
    }
    if (!profileData.city?.trim()) {
      missingFields.push("Город");
    }
    if (!profileData.bio?.trim()) {
      missingFields.push("О себе");
    }
    
    // Fetch tutor-specific data
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor profile:", tutorError);
      throw new Error("Не удалось загрузить данные репетитора");
    }
    
    if (!tutorData) {
      missingFields.push("Профиль репетитора не создан");
    } else {
      // Check required tutor fields
      if (!tutorData.education_institution?.trim()) {
        missingFields.push("Учебное заведение");
      }
      if (!tutorData.degree?.trim()) {
        missingFields.push("Степень/специальность");
      }
      if (!tutorData.graduation_year || tutorData.graduation_year < 1950) {
        missingFields.push("Год окончания");
      }
      if (!tutorData.experience || tutorData.experience < 0) {
        warnings.push("Опыт работы не указан");
      }
    }
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("*")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching subjects:", subjectsError);
      warnings.push("Не удалось проверить предметы");
    } else if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Хотя бы один предмет");
    }
    
    const isValid = missingFields.length === 0;
    
    console.log("Validation result:", { isValid, missingFields, warnings });
    
    return {
      isValid,
      missingFields,
      warnings
    };
  } catch (error) {
    console.error("Error validating tutor profile:", error);
    return {
      isValid: false,
      missingFields: ["Ошибка валидации профиля"],
      warnings: []
    };
  }
};

/**
 * Get comprehensive tutor publication status
 */
export const getTutorPublicationStatus = async (tutorId: string) => {
  try {
    // Get validation status
    const validation = await validateTutorProfile(tutorId);
    
    // Get current publication status
    const { data: tutorData, error } = await supabase
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching publication status:", error);
      throw error;
    }
    
    const isPublished = tutorData?.is_published || false;
    
    return {
      isValid: validation.isValid,
      missingFields: validation.missingFields,
      warnings: validation.warnings,
      isPublished
    };
  } catch (error) {
    console.error("Error getting publication status:", error);
    throw error;
  }
};
