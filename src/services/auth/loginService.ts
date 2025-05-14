
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
 * Login a user with email and password
 */
export const loginWithEmailAndPassword = async ({ 
  email, 
  password 
}: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log("Attempting login for email:", email);
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Ошибка входа. Пожалуйста, попробуйте снова.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Неверный email или пароль";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email не подтвержден";
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
        error: "Не удалось получить данные пользователя",
      };
    }

    // Fetch user role from profiles table
    try {
      const role = await fetchUserRole(data.user.id);
      
      console.log("User logged in successfully with role:", role);
      return {
        success: true,
        user: data.user,
        role,
      };
    } catch (roleError) {
      console.error("Error fetching user role:", roleError);
      
      // Still return success but with a warning
      return {
        success: true,
        user: data.user,
        error: "Не удалось загрузить роль пользователя",
      };
    }
  } catch (error) {
    console.error("Unexpected error during login:", error);
    return {
      success: false,
      error: "Произошла неожиданная ошибка при входе в систему",
    };
  }
};
