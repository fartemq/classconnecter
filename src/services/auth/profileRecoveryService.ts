
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Сервис для восстановления профилей и проверки их состояния
 */

export interface ProfileRecoveryResult {
  success: boolean;
  message: string;
  profileExists: boolean;
  emailConfirmed: boolean;
}

/**
 * Проверяет состояние профиля и email подтверждения для пользователя
 */
export const checkUserProfileStatus = async (userId: string): Promise<ProfileRecoveryResult> => {
  try {
    // Проверяем основной профиль
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error checking profile:", profileError);
      return {
        success: false,
        message: "Ошибка при проверке профиля",
        profileExists: false,
        emailConfirmed: false
      };
    }

    // Проверяем статус email подтверждения
    const { data: { user } } = await supabase.auth.getUser();
    const emailConfirmed = user?.email_confirmed_at != null;

    return {
      success: true,
      message: profile ? "Профиль найден" : "Профиль не найден",
      profileExists: !!profile,
      emailConfirmed
    };
  } catch (error) {
    console.error("Error in checkUserProfileStatus:", error);
    return {
      success: false,
      message: "Ошибка при проверке статуса пользователя",
      profileExists: false,
      emailConfirmed: false
    };
  }
};

/**
 * Создает профиль для пользователя вручную
 */
export const createMissingProfile = async (userId: string, userData: {
  firstName: string;
  lastName: string;
  role: "student" | "tutor";
  city?: string;
  phone?: string;
  bio?: string;
}): Promise<ProfileRecoveryResult> => {
  try {
    // Создаем основной профиль
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        city: userData.city || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return {
        success: false,
        message: "Ошибка при создании основного профиля",
        profileExists: false,
        emailConfirmed: false
      };
    }

    // Создаем специализированный профиль
    if (userData.role === "student") {
      const { error: studentError } = await supabase
        .from("student_profiles")
        .insert({
          id: userId,
          subjects: [],
          budget: 1000
        });

      if (studentError) {
        console.error("Error creating student profile:", studentError);
      }
    } else if (userData.role === "tutor") {
      const { error: tutorError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: userId,
          education_institution: "",
          degree: "",
          graduation_year: new Date().getFullYear(),
          experience: 0,
          is_published: false,
          education_verified: false
        });

      if (tutorError) {
        console.error("Error creating tutor profile:", tutorError);
      }
    }

    return {
      success: true,
      message: "Профиль успешно создан",
      profileExists: true,
      emailConfirmed: false
    };
  } catch (error) {
    console.error("Error in createMissingProfile:", error);
    return {
      success: false,
      message: "Ошибка при создании профиля",
      profileExists: false,
      emailConfirmed: false
    };
  }
};

/**
 * Запускает процедуру создания отсутствующих профилей через базу данных
 */
export const runProfileRecovery = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('create_missing_profiles');
    
    if (error) {
      console.error("Error running profile recovery:", error);
      toast({
        title: "Ошибка восстановления",
        description: "Не удалось запустить восстановление профилей",
        variant: "destructive"
      });
      return false;
    }

    const successCount = data?.filter((result: any) => result.profile_created).length || 0;
    const errorCount = data?.filter((result: any) => !result.profile_created).length || 0;

    if (successCount > 0) {
      toast({
        title: "Профили восстановлены",
        description: `Создано профилей: ${successCount}. Ошибок: ${errorCount}`,
      });
    }

    return true;
  } catch (error) {
    console.error("Error in runProfileRecovery:", error);
    return false;
  }
};
