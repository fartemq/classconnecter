
import { supabase } from "@/integrations/supabase/client";

/**
 * Проверяет, добавил ли репетитор хотя бы один предмет
 */
export async function hasTutorAddedSubjects(tutorId: string): Promise<boolean> {
  try {
    console.log("Checking if tutor has added subjects:", tutorId);
    // Проверка наличия предметов у репетитора
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (error) {
      console.error("Error checking tutor subjects:", error);
      throw error;
    }
    
    console.log("Tutor subjects check result:", data);
    return !!data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added subjects:", error);
    return false;
  }
}

/**
 * Проверяет, добавил ли репетитор расписание
 */
export async function hasTutorAddedSchedule(tutorId: string): Promise<boolean> {
  try {
    console.log("Checking if tutor has added schedule:", tutorId);
    // Проверка наличия расписания у репетитора
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (error) {
      console.error("Error checking tutor schedule:", error);
      // Don't throw for PGRST116 (no results) error
      if (error.code !== 'PGRST116') throw error;
    }
    
    console.log("Tutor schedule check result:", data);
    return !!data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added schedule:", error);
    return false;
  }
}

/**
 * Проверяет полноту профиля репетитора для публикации
 */
export async function validateTutorProfile(tutorId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> {
  try {
    console.log("Validating tutor profile for ID:", tutorId);
    
    // Проверка основного профиля
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.error("No profile data found for ID:", tutorId);
      return {
        isValid: false,
        missingFields: ["Профиль не найден"],
        warnings: []
      };
    }
    
    console.log("Profile data fetched:", profileData);
    
    // Проверка профиля репетитора
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience")
      .eq("id", tutorId)
      .maybeSingle();
    
    // Не выбрасываем ошибку, если tutor_profile не найден (код PGRST116)  
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor profile data:", tutorError);
      throw tutorError;
    }
    
    console.log("Tutor data fetched:", tutorData);
    
    // Проверка предметов
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
      throw subjectsError;
    }
    
    console.log("Subjects data fetched:", subjectsData);
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Проверка обязательных полей в основном профиле
    if (!profileData.first_name || profileData.first_name.trim() === "") 
      missingFields.push("Имя");
      
    if (!profileData.last_name || profileData.last_name.trim() === "") 
      missingFields.push("Фамилия");
      
    if (!profileData.bio || profileData.bio.trim() === "" || profileData.bio.length < 20) 
      missingFields.push("О себе");
      
    if (!profileData.city || profileData.city.trim() === "") 
      missingFields.push("Город");
      
    if (!profileData.avatar_url) 
      missingFields.push("Фотография профиля");
    
    // Проверка полей профиля репетитора
    if (!tutorData || !tutorData.education_institution || tutorData.education_institution.trim() === "") 
      missingFields.push("Учебное заведение");
      
    if (!tutorData || !tutorData.degree || tutorData.degree.trim() === "") 
      missingFields.push("Специальность");
    
    // Проверка наличия предметов
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Предупреждения
    if (!tutorData || !tutorData.experience) {
      warnings.push("Рекомендуется указать опыт работы");
    }
    
    const result = {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
    
    console.log("Validation result:", result);
    
    return result;
  } catch (error) {
    console.error("Error validating tutor profile:", error);
    return {
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: [],
    };
  }
}
