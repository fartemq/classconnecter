
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the currently logged in user
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

/**
 * Gets the user role from the profiles table
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching role for user:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    console.log("User role data:", data);
    return data?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
