
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the user role from the profiles table
 * With fallback to user metadata if not found in profiles
 */
export const fetchUserRole = async (user: User): Promise<string | null> => {
  try {
    // Try to get the role from the profiles table first
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
    
    // If we found a role in profiles, return it
    if (profileData?.role) {
      console.log("Found role in profiles:", profileData.role);
      return profileData.role;
    }
    
    // Fall back to metadata if role not in profiles
    const metadataRole = user.user_metadata?.role;
    if (metadataRole) {
      console.log("Using role from metadata:", metadataRole);
      
      // Update the profile with the metadata role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: metadataRole })
        .eq("id", user.id);
      
      if (updateError) {
        console.error("Error updating profile role:", updateError);
      }
      
      return metadataRole;
    }
    
    // Default role if nothing found
    console.log("No role found, using default 'student'");
    return 'student';
  } catch (error) {
    console.error("Error in fetchUserRole:", error);
    return 'student'; // Default fallback
  }
};
