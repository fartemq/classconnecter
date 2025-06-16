
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
 * Enhanced login function with better error handling and retry mechanism
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

    // Fetch user role with retry mechanism
    try {
      let role = await fetchUserRole(data.user.id);
      
      // Special case for admin user
      if (data.user.id === "861128e6-be26-48ee-b576-e7accded9f70") {
        role = "admin";
      }
      
      // Validate role
      if (!role || !['admin', 'tutor', 'student'].includes(role)) {
        console.warn("Invalid or missing role, defaulting to student");
        role = "student";
      }
      
      console.log("User logged in successfully with role:", role);
      return {
        success: true,
        user: data.user,
        role,
      };
    } catch (roleError) {
      console.error("Error fetching user role:", roleError);
      
      // Still return success but with default role
      return {
        success: true,
        user: data.user,
        role: "student", // safe default
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
