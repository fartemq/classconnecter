
import { supabase } from "@/integrations/supabase/client";

/**
 * Logs in a user with email and password
 */
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting login for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Необходимо подтвердить email. Проверьте вашу почту.");
      } else if (error.message.includes("Invalid login credentials")) {
        throw new Error("Неверный email или пароль");
      }
      
      throw error;
    }

    console.log("Login successful for:", email);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logs out the current user
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
