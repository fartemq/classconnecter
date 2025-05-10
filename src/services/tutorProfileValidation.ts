
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates a tutor profile to check if it's complete
 */
export const validateTutorProfile = async (tutorId: string) => {
  try {
    console.log("Validating tutor profile for:", tutorId);
    const missingFields = [];
    const warnings = [];
    
    // Check basic profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return { isValid: false, missingFields: ["Ошибка проверки профиля"], warnings: [] };
    }
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, graduation_year, experience")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor data:", tutorError);
      return { isValid: false, missingFields: ["Ошибка проверки профиля репетитора"], warnings: [] };
    }
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("subject_id, is_active")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
      return { isValid: false, missingFields: ["Ошибка проверки предметов"], warnings: [] };
    }
    
    // Validate required fields
    if (!profileData?.first_name || profileData.first_name.trim() === "") {
      missingFields.push("Имя");
    }
    
    if (!profileData?.last_name || profileData.last_name.trim() === "") {
      missingFields.push("Фамилия");
    }
    
    if (!profileData?.bio || profileData.bio.trim() === "") {
      missingFields.push("Описание (опыт преподавания)");
    }
    
    if (!profileData?.city || profileData.city.trim() === "") {
      missingFields.push("Город");
    }
    
    // Check education fields if tutor data exists
    if (tutorData) {
      if (!tutorData.education_institution || tutorData.education_institution.trim() === "") {
        missingFields.push("Учебное заведение");
      }
      
      if (!tutorData.degree || tutorData.degree.trim() === "") {
        missingFields.push("Специальность/степень");
      }
    } else {
      missingFields.push("Образование");
    }
    
    // Check subjects
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Add warnings
    if (!profileData?.avatar_url) {
      warnings.push("Добавьте фотографию профиля для повышения доверия студентов");
    }
    
    if (tutorData && !tutorData.experience) {
      warnings.push("Укажите свой опыт преподавания в годах");
    }
    
    console.log("Validation result:", { 
      isValid: missingFields.length === 0, 
      missingFields, 
      warnings 
    });
    
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
 * Check if a tutor has added any subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from("tutor_subjects")
      .select("*", { count: 'exact', head: true })
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (error) {
      console.error("Error checking for tutor subjects:", error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking for tutor subjects:", error);
    return false;
  }
};

/**
 * Check if a tutor has added any schedule slots
 */
export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from("tutor_schedule")
      .select("*", { count: 'exact', head: true })
      .eq("tutor_id", tutorId)
      .eq("is_available", true);
      
    if (error) {
      console.error("Error checking for tutor schedule:", error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking for tutor schedule:", error);
    return false;
  }
};
