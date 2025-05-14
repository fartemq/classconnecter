
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the user's role from the profiles table
 */
export async function fetchUserRole(user: User): Promise<string | null> {
  if (!user?.id) {
    return null;
  }

  try {
    console.log("Fetching role for user:", user.id);
    
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
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
