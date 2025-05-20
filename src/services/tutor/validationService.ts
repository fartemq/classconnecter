
import { supabase } from "@/integrations/supabase/client";

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
      
    if (error) throw error;
    return count !== null && count > 0;
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

/**
 * Validate the completeness of a tutor profile for publishing
 */
export const validateTutorProfile = async (tutorId: string) => {
  try {
    // Get tutor profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        first_name,
        last_name,
        avatar_url,
        city,
        tutor_profiles (
          education,
          teaching_methodology,
          experience
        )
      `)
      .eq("id", tutorId)
      .single();

    if (profileError || !profileData) {
      console.error("Error fetching profile for validation:", profileError);
      return {
        isValid: false,
        missingFields: ["Профиль не найден"],
        warnings: [],
      };
    }

    // Check if tutor has added subjects
    const hasSubjects = await hasTutorAddedSubjects(tutorId);

    // List of missing required fields
    const missingFields = [];
    
    // Validate basic profile fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    if (!profileData.city) missingFields.push("Город");
    
    // Validate tutor-specific fields
    const tutorProfile = profileData.tutor_profiles;
    if (!tutorProfile || typeof tutorProfile !== 'object') {
      missingFields.push("Профиль репетитора не создан");
    } else {
      // Convert array to object if necessary
      const tutorData = Array.isArray(tutorProfile) ? tutorProfile[0] : tutorProfile;
      
      if (!tutorData.education) missingFields.push("Образование");
      if (!tutorData.teaching_methodology) missingFields.push("Методика преподавания");
      if (tutorData.experience === null || tutorData.experience === undefined) {
        missingFields.push("Опыт преподавания");
      }
    }
    
    // Check subjects
    if (!hasSubjects) missingFields.push("Предметы и цены");

    // Optional fields that improve profile quality
    const warnings = [];
    if (!profileData.last_name) warnings.push("Рекомендуется указать фамилию");
    
    // Profile is valid if there are no missing required fields
    const isValid = missingFields.length === 0;

    return {
      isValid,
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
 * Get the publication status and validation of a tutor profile
 */
export const getTutorPublicationStatus = async (tutorId: string) => {
  try {
    // Get the current published status
    const { data: profileData } = await supabase
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .maybeSingle();
    
    const isPublished = !!profileData?.is_published;
    
    // Validate the profile
    const validation = await validateTutorProfile(tutorId);
    
    return {
      isPublished,
      ...validation
    };
  } catch (error) {
    console.error("Error getting tutor publication status:", error);
    return {
      isPublished: false,
      isValid: false,
      missingFields: ["Ошибка проверки статуса публикации"],
      warnings: []
    };
  }
};
