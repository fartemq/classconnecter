
import { supabase } from "@/integrations/supabase/client";
import { TutorProfile } from "@/types/tutor";

export interface ProfileValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

export const validateTutorProfile = async (tutorId: string): Promise<ProfileValidationResult> => {
  try {
    // Check if profile exists
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
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (subjectsError) throw subjectsError;
    
    // Check schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("tutor_schedule")
      .select("id")
      .eq("tutor_id", tutorId)
      .limit(1);
      
    if (scheduleError) throw scheduleError;
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    
    // Basic profile validations
    if (!profileData.first_name) missingFields.push("Имя");
    if (!profileData.last_name) missingFields.push("Фамилия");
    if (!profileData.bio) missingFields.push("О себе");
    if (!profileData.city) missingFields.push("Город");
    if (!profileData.avatar_url) missingFields.push("Фотография профиля");
    
    // Tutor profile validations
    if (!tutorData.education_institution) missingFields.push("Учебное заведение");
    if (!tutorData.degree) missingFields.push("Специальность");
    if (!tutorData.experience) missingFields.push("Опыт работы");
    
    // Subjects validations
    if (!subjectsData || subjectsData.length === 0) {
      missingFields.push("Предметы обучения");
    }
    
    // Schedule validations
    if (!scheduleData || scheduleData.length === 0) {
      warnings.push("У вас не добавлено расписание. Студенты не смогут записаться к вам на занятия.");
    }
    
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

export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tutor_subjects')
      .select('id')
      .eq('tutor_id', tutorId)
      .limit(1);
    
    if (error) {
      console.error("Error checking tutor subjects:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error("Exception checking tutor subjects:", err);
    return false;
  }
};

export const hasTutorAddedSchedule = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tutor_schedule')
      .select('id')
      .eq('tutor_id', tutorId)
      .limit(1);
    
    if (error) {
      console.error("Error checking tutor schedule:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error("Exception checking tutor schedule:", err);
    return false;
  }
};
