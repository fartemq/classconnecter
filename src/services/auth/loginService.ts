
import { supabase } from "@/integrations/supabase/client";

/**
 * Log in user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<any> => {
  try {
    console.log("Attempting to login with email:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      
      // Handle specific errors
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Пожалуйста, подтвердите свой email перед входом");
      } else if (error.message.includes("Invalid login credentials")) {
        throw new Error("Неверный email или пароль");
      }
      
      throw error;
    }
    
    console.log("Login successful!");
    console.log("User role from metadata:", data.user?.user_metadata?.role);
    return data;
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
};

/**
 * Log out user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    console.log("Logging out user");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
    
    console.log("Logout successful");
  } catch (error) {
    console.error("Error in logoutUser:", error);
    throw error;
  }
};
