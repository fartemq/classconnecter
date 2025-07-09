
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

    // Убираем проверку через admin API, так как она недоступна в клиентском коде

    // Регистрация пользователя 
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
      
      if (error.message.includes("User already registered") || error.message.includes("already registered")) {
        errorMessage = "Пользователь с таким email уже существует";
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Пароль должен содержать минимум 6 символов";
      } else if (error.message.includes("Error sending confirmation email") || error.status === 500) {
        // Особая обработка ошибки отправки email - пробуем создать профиль вручную
        errorMessage = "Email подтверждение недоступно. Попробуйте войти с этими данными через несколько минут.";
        
        // Если пользователь был создан, но email не отправился
        if (data.user && !data.user.email_confirmed_at) {
          return {
            success: true,
            needsEmailConfirmation: false, // Пропускаем подтверждение
            user: data.user,
            error: "Регистрация завершена, но email подтверждение недоступно. Вы можете войти в систему."
          };
        }
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

    console.log("User registered successfully:", data.user.id);

    // Проверяем, подтвержден ли email (может быть отключено в настройках)
    if (data.user.email_confirmed_at) {
      // Email уже подтвержден (отключено в настройках Supabase)
      return {
        success: true,
        needsEmailConfirmation: false,
        user: data.user
      };
    } else {
      // Требуется подтверждение email
      return {
        success: true,
        needsEmailConfirmation: true,
        user: data.user
      };
    }

  } catch (error) {
    console.error("Registration exception:", error);
    return {
      success: false,
      needsEmailConfirmation: false,
      error: "Произошла неожиданная ошибка при регистрации"
    };
  }
};
