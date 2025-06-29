
import { supabase } from "@/integrations/supabase/client";

export interface ReliableLoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: any;
  role?: string;
  needsEmailConfirmation?: boolean;
  error?: string;
}

/**
 * Надёжный сервис входа с проверкой подтверждения email
 */
export const loginUserReliable = async ({ email, password }: ReliableLoginCredentials): Promise<LoginResult> => {
  try {
    console.log("Attempting reliable login for:", email);
    
    // Валидация входных данных
    if (!email || !password) {
      return {
        success: false,
        error: "Email и пароль обязательны для заполнения"
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: "Введите корректный email адрес"
      };
    }
    
    // Вход в систему
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Ошибка входа";
      
      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Неверный email или пароль";
          break;
        case "Email not confirmed":
          errorMessage = "Email не подтверждён. Проверьте почту и подтвердите регистрацию";
          break;
        case "Too many requests":
          errorMessage = "Слишком много попыток входа. Попробуйте через несколько минут";
          break;
        case "User not found":
          errorMessage = "Пользователь не найден. Проверьте email или зарегистрируйтесь";
          break;
        default:
          if (error.message?.includes("network")) {
            errorMessage = "Проблемы с подключением. Проверьте интернет";
          } else if (error.message?.includes("rate")) {
            errorMessage = "Слишком много попыток. Подождите и попробуйте снова";
          }
          break;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: "Не удалось получить данные пользователя"
      };
    }

    // КРИТИЧЕСКАЯ ПРОВЕРКА: Email должен быть подтверждён
    if (!data.user.email_confirmed_at) {
      // Выходим из системы
      await supabase.auth.signOut();
      return {
        success: false,
        needsEmailConfirmation: true,
        error: "Email не подтверждён. Проверьте почту и подтвердите регистрацию"
      };
    }

    // Проверяем существование профиля
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, is_blocked")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile check error:", profileError);
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Ошибка проверки профиля"
      };
    }

    // Если профиль не найден, запрещаем вход
    if (!profile) {
      console.error("User has no profile:", data.user.id);
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Профиль не найден. Возможно, регистрация не была завершена"
      };
    }

    // Проверяем блокировку
    if (profile.is_blocked) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Ваш аккаунт заблокирован. Обратитесь в поддержку"
      };
    }

    const role = profile.role;
    
    // Проверяем корректность роли
    if (!role || !['admin', 'tutor', 'student'].includes(role)) {
      console.warn("Invalid role:", role);
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Некорректная роль пользователя"
      };
    }
    
    console.log("User logged in successfully with role:", role);
    return {
      success: true,
      user: data.user,
      role,
    };

  } catch (error) {
    console.error("Unexpected error during login:", error);
    
    let errorMessage = "Произошла неожиданная ошибка";
    
    if (!navigator.onLine) {
      errorMessage = "Нет подключения к интернету";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};
