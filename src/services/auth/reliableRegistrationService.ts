
import { supabase } from "@/integrations/supabase/client";

export interface ReliableRegistrationData {
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
  needsEmailConfirmation: boolean;
  user?: any;
  error?: string;
}

/**
 * Надёжный сервис регистрации с обязательным подтверждением email
 */
export const registerUserReliable = async (userData: ReliableRegistrationData): Promise<RegistrationResult> => {
  try {
    console.log("Starting reliable registration for:", userData.email);
    
    // Валидация данных
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      return {
        success: false,
        needsEmailConfirmation: false,
        error: "Все обязательные поля должны быть заполнены"
      };
    }

    if (userData.password.length < 6) {
      return {
        success: false,
        needsEmailConfirmation: false,
        error: "Пароль должен содержать минимум 6 символов"
      };
    }

    // Регистрация пользователя с обязательным подтверждением email
    const { data, error } = await supabase.auth.signUp({
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          city: userData.city || '',
          phone: userData.phone || '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Произошла ошибка при регистрации";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "Пользователь с таким email уже существует";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Пароль должен содержать минимум 6 символов";
      } else if (error.message.includes("email rate limit exceeded") || error.message.includes("over_email_send_rate_limit")) {
        errorMessage = "Превышен лимит отправки писем. Попробуйте через несколько минут";
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Введите корректный email адрес";
      } else if (error.message.includes("Email rate limit exceeded")) {
        errorMessage = "Слишком много попыток отправки email. Подождите несколько минут";
      }
      
      return {
        success: false,
        needsEmailConfirmation: false,
        error: errorMessage
      };
    }

    if (!data.user) {
      return {
        success: false,
        needsEmailConfirmation: false,
        error: "Не удалось создать пользователя"
      };
    }

    console.log("User registered successfully, awaiting email confirmation:", data.user.id);

    // Успешная регистрация - всегда требуем подтверждение email
    return {
      success: true,
      needsEmailConfirmation: true,
      user: data.user
    };

  } catch (error) {
    console.error("Registration exception:", error);
    return {
      success: false,
      needsEmailConfirmation: false,
      error: "Произошла неожиданная ошибка при регистрации"
    };
  }
};
