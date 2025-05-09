
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
    
    // Get user profile data including role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
    
    console.log("User role from database:", profileData?.role);
    console.log("User role from metadata:", data.user?.user_metadata?.role);
    
    // If role is not in profile but is in metadata, update the profile
    if (profileData && !profileData.role && data.user?.user_metadata?.role) {
      console.log("Updating profile with role from metadata:", data.user.user_metadata.role);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: data.user.user_metadata.role })
        .eq("id", data.user.id);
      
      if (updateError) {
        console.error("Error updating user role:", updateError);
      }
    }
    
    // Set role in user metadata for convenience
    const finalRole = profileData?.role || data.user?.user_metadata?.role || 'student';
    
    // Return data with determined role
    return {
      ...data,
      role: finalRole
    };
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
