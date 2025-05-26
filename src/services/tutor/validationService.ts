
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
    console.log("Validating tutor profile for ID:", tutorId);
    
    // Get tutor profile data with proper joins
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        city,
        bio,
        tutor_profiles (
          education_institution,
          methodology,
          experience,
          is_published,
          degree,
          graduation_year
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

    console.log("Profile data for validation:", profileData);

    // Check if tutor has added subjects and schedule
    const [hasSubjects, hasSchedule] = await Promise.all([
      hasTutorAddedSubjects(tutorId),
      hasTutorAddedSchedule(tutorId)
    ]);

    console.log("Has subjects:", hasSubjects, "Has schedule:", hasSchedule);

    // List of missing required fields
    const missingFields = [];
    const warnings = [];
    
    // Validate basic profile fields
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.bio) missingFields.push("О себе");
    
    // Validate tutor-specific fields
    const tutorProfileData = profileData.tutor_profiles;
    
    // Handle the tutor profile data properly
    let tutorProfile: any = null;
    
    if (tutorProfileData) {
      if (Array.isArray(tutorProfileData)) {
        tutorProfile = tutorProfileData.length > 0 ? tutorProfileData[0] : null;
      } else {
        tutorProfile = tutorProfileData;
      }
    }
    
    if (!tutorProfile) {
      missingFields.push("Профиль репетитора не создан");
    } else {
      if (!tutorProfile.education_institution) missingFields.push("Учебное заведение");
      if (!tutorProfile.degree) missingFields.push("Степень образования");
      if (!tutorProfile.graduation_year) missingFields.push("Год окончания");
      if (!tutorProfile.methodology) missingFields.push("Методика преподавания");
      if (tutorProfile.experience === null || tutorProfile.experience === undefined) {
        missingFields.push("Опыт преподавания");
      }
    }
    
    // Check subjects
    if (!hasSubjects) missingFields.push("Предметы и цены");
    
    // Check schedule
    if (!hasSchedule) warnings.push("Рекомендуется добавить расписание для удобства учеников");

    // Additional warnings for profile quality
    if (profileData.bio && profileData.bio.length < 50) {
      warnings.push("Рекомендуется расширить описание о себе");
    }
    
    console.log("Missing fields:", missingFields);
    console.log("Warnings:", warnings);
    
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
    console.log("Getting publication status for tutor ID:", tutorId);
    
    // Get the current published status
    const { data: profileData } = await supabase
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .maybeSingle();
    
    const isPublished = !!profileData?.is_published;
    console.log("Is published:", isPublished);
    
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
