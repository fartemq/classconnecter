
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the user's role from the profiles table
 */
export async function fetchUserRole(user: User | string): Promise<string | null> {
  if (!user) {
    return null;
  }

  const userId = typeof user === 'string' ? user : user.id;

  try {
    console.log("Fetching role for user:", userId);
    
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    if (profileData?.role) {
      console.log("Found role in profiles:", profileData.role);
      return profileData.role;
    }

    return null;
  } catch (err) {
    console.error("Error in fetchUserRole:", err);
    return null;
  }
}

/**
 * Checks if a user has a specific role
 */
export function hasRole(userRole: string | null, requiredRole: string | undefined): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;
  
  return userRole === requiredRole;
}
