
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole } from "./userService";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: any;
  role?: string | null;
  error?: string;
}

/**
 * Enhanced login function with profile existence check
 */
export const loginWithEmailAndPassword = async ({ 
  email, 
  password 
}: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log("Attempting login for email:", email);
    
    // Validate input
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
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Ошибка входа. Пожалуйста, попробуйте снова.";
      
      // Более детальная обработка ошибок
      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Неверный email или пароль. Проверьте данные и попробуйте снова.";
          break;
        case "Email not confirmed":
          errorMessage = "Email не подтвержден. Проверьте почту и подтвердите регистрацию.";
          break;
        case "Too many requests":
          errorMessage = "Слишком много попыток входа. Попробуйте через несколько минут.";
          break;
        case "User not found":
          errorMessage = "Пользователь с таким email не найден. Проверьте email или зарегистрируйтесь.";
          break;
        default:
          if (error.message?.includes("network")) {
            errorMessage = "Проблемы с подключением. Проверьте интернет и попробуйте снова.";
          } else if (error.message?.includes("timeout")) {
            errorMessage = "Превышено время ожидания. Попробуйте еще раз.";
          } else if (error.message?.includes("rate")) {
            errorMessage = "Слишком много попыток. Подождите немного и попробуйте снова.";
          }
          break;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }

    if (!data?.user) {
      console.error("Login returned no user");
      return {
        success: false,
        error: "Не удалось получить данные пользователя. Попробуйте еще раз.",
      };
    }

    // КРИТИЧЕСКАЯ ПРОВЕРКА: Проверяем существование профиля
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile check error:", profileError);
        // Выходим из системы если профиль не найден
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Ошибка проверки профиля. Обратитесь в поддержку.",
        };
      }

      // Если профиль не найден, запрещаем вход
      if (!profile) {
        console.error("User has no profile:", data.user.id);
        // Выходим из системы
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Профиль пользователя не найден. Возможно, регистрация не была завершена. Попробуйте зарегистрироваться заново.",
        };
      }

      // Проверяем, что пользователь не заблокирован
      const { data: profileData, error: profileDataError } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", data.user.id)
        .single();

      if (profileDataError) {
        console.error("Profile data check error:", profileDataError);
      } else if (profileData?.is_blocked) {
        // Выходим из системы если пользователь заблокирован
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Ваш аккаунт заблокирован. Обратитесь в поддержку.",
        };
      }

      const role = profile.role;
      
      // Special case for admin user
      if (data.user.id === "861128e6-be26-48ee-b576-e7accded9f70") {
        return {
          success: true,
          user: data.user,
          role: "admin",
        };
      }
      
      // Validate role
      if (!role || !['admin', 'tutor', 'student'].includes(role)) {
        console.warn("Invalid role, denying login:", role);
        await supabase.auth.signOut();
        return {
          success: false,
          error: "Некорректная роль пользователя. Обратитесь в поддержку.",
        };
      }
      
      console.log("User logged in successfully with role:", role);
      return {
        success: true,
        user: data.user,
        role,
      };
    } catch (profileCheckError) {
      console.error("Error checking user profile:", profileCheckError);
      
      // Выходим из системы при ошибке проверки профиля
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Ошибка проверки профиля пользователя. Попробуйте еще раз.",
      };
    }
  } catch (error) {
    console.error("Unexpected error during login:", error);
    
    let errorMessage = "Произошла неожиданная ошибка при входе в систему";
    
    if (!navigator.onLine) {
      errorMessage = "Нет подключения к интернету. Проверьте соединение и попробуйте снова.";
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = "Проблемы с сетью. Попробуйте обновить страницу и войти снова.";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Simplified login user function with enhanced error handling
 */
export const loginUser = async (email: string, password: string) => {
  const response = await loginWithEmailAndPassword({ email, password });
  
  if (!response.success) {
    throw new Error(response.error);
  }
  
  return response;
};
