
import { supabase } from "@/integrations/supabase/client";

/**
 * Validate tutor profile completeness
 */
export async function validateTutorProfile(tutorId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> {
  try {
    console.log("Validating tutor profile:", tutorId);
    
    // Check basic profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      throw profileError;
    }
    
    // Check tutor-specific profile
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience, methodology, achievements, video_url")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor data:", tutorError);
      throw tutorError;
    }
    
    // Check subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching subject data:", subjectsError);
      throw subjectsError;
    }
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
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
    
    // Check recommended fields (warnings)
    if (!tutorData || !tutorData.methodology) warnings.push("Методика преподавания");
    if (!tutorData || (tutorData.experience === null || tutorData.experience === undefined)) warnings.push("Опыт преподавания (лет)");
    if (!tutorData || !tutorData.achievements) warnings.push("Достижения");
    if (!tutorData || !tutorData.video_url) warnings.push("Видео-презентация");
    
    console.log("Validation result:", {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    });
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  } catch (error) {
    console.error("Error validating profile:", error);
    return {
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: [],
    };
  }
}

/**
 * Check if tutor has added any subjects
 */
export async function hasTutorAddedSubjects(tutorId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from("tutor_subjects")
      .select("*", { count: 'exact', head: true })
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking if tutor has subjects:", error);
    return false;
  }
}

/**
 * Check if tutor has added any schedule slots
 */
export async function hasTutorAddedSchedule(tutorId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from("tutor_schedule")
      .select("*", { count: 'exact', head: true })
      .eq("tutor_id", tutorId)
      .eq("is_available", true);
      
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking if tutor has schedule:", error);
    return false;
  }
}
