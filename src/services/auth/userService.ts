
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch the user's role from the profiles table
 */
export const fetchUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching role for user:", userId);
    
    // Check the profiles table directly (no admin API calls)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      
      if (profileError.code === "PGRST116") {
        console.log("Profile not found, user might be new");
        return null;
      }
      
      throw profileError;
    }
    
    if (profile && profile.role) {
      console.log("Found role in profiles table:", profile.role);
      return profile.role;
    }
    
    console.log("No role found for user");
    return null;
  } catch (error) {
    console.error("Error in fetchUserRole:", error);
    throw error;
  }
};

/**
 * Update a user's profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: { 
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    city?: string;
    avatar_url?: string;
    role?: string;
  }
) => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // Add timestamp
    const dataWithTimestamp = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    if (!existingProfile) {
      // Create new profile
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...dataWithTimestamp,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
    } else {
      // Update existing profile
      const { error } = await supabase
        .from("profiles")
        .update(dataWithTimestamp)
        .eq("id", userId);
        
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { 
      success: false, 
      error 
    };
  }
};

/**
 * Get a user's profile
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) throw error;
    return { success: true, profile: data };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { 
      success: false, 
      error,
      profile: null
    };
  }
};
