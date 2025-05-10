
import { supabase } from "@/integrations/supabase/client";

/**
 * Проверяет, добавил ли репетитор хотя бы один предмет
 */
export async function hasTutorAddedSubjects(tutorId: string): Promise<boolean> {
  try {
    // Проверка наличия предметов у репетитора
    const { data, error } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (error) throw error;
    
    return data && data.length > 0;
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
    // Проверка наличия расписания у репетитора
    const { data, error } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (error && error.code !== 'PGRST116') throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if tutor has added schedule:", error);
    return false;
  }
}

/**
 * Проверяет полноту профиля репетитора
 */
export async function validateTutorProfile(tutorId: string): Promise<{
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> {
  try {
    // Проверка основного профиля
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, city, avatar_url")
      .eq("id", tutorId)
      .single();
      
    if (profileError) throw profileError;
    
    // Проверка профиля репетитора
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;
    
    // Проверка предметов
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select("id")
      .eq("tutor_id", tutorId);
      
    if (subjectsError) throw subjectsError;
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Проверка обязательных полей
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio || profileData.bio.length < 20) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData || !tutorData.degree) missingFields.push("Специальность");
    
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Предупреждения
    if (!tutorData || !tutorData.experience) {
      warnings.push("Рекомендуется указать опыт работы");
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
}
