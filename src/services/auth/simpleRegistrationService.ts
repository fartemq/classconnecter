
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SimpleRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  city?: string;
  phone?: string;
}

export interface RegistrationResult {
  success: boolean;
  needsEmailConfirmation?: boolean;
  error?: string;
}

/**
 * Упрощённый сервис регистрации
 */
export const registerUserSimple = async (userData: SimpleRegistrationData): Promise<RegistrationResult> => {
  try {
    console.log("Starting registration for:", userData.email);
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          city: userData.city || '',
          phone: userData.phone || '',
        }
      }
    });

    if (error) {
      console.error("Registration error:", error);
      
      // Обрабатываем частые ошибки
      if (error.message.includes("User already registered")) {
        return {
          success: false,
          error: "Пользователь с таким email уже существует"
        };
      }
      
      if (error.message.includes("Password should be at least")) {
        return {
          success: false,
          error: "Пароль должен содержать минимум 6 символов"
        };
      }

      if (error.message.includes("Email rate limit exceeded")) {
        return {
          success: false,
          error: "Превышен лимит отправки писем. Попробуйте позже"
        };
      }

      // Если проблема с отправкой email - не блокируем регистрацию
      if (error.message.includes("Error sending confirmation email")) {
        console.warn("Email confirmation failed, but user might be created");
        
        // Проверяем, создался ли пользователь
        if (data.user) {
          return {
            success: true,
            needsEmailConfirmation: false // Отключаем подтверждение email
          };
        }
      }
      
      return {
        success: false,
        error: error.message || "Произошла ошибка при регистрации"
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Не удалось создать пользователя"
      };
    }

    console.log("User created successfully:", data.user.id);

    return {
      success: true,
      needsEmailConfirmation: !data.session // Есть ли сессия сразу
    };

  } catch (error) {
    console.error("Registration exception:", error);
    return {
      success: false,
      error: "Произошла неожиданная ошибка"
    };
  }
};
