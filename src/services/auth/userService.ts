
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch the user's role from the profiles table using the security definer function
 */
export const fetchUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching role for user using security definer function:", userId);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );
    
    const queryPromise = supabase.rpc('get_current_user_role');
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error("Error fetching role via RPC:", error);
      
      // Fallback to direct query if RPC fails
      const fallbackPromise = supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
        
      const { data: profile, error: profileError } = await Promise.race([
        fallbackPromise, 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Fallback timeout')), 5000))
      ]) as any;
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }
      
      if (profile && profile.role) {
        console.log("Found role via fallback query:", profile.role);
        return profile.role;
      }
      
      return null;
    }
    
    console.log("Found role via security definer function:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchUserRole:", error);
    return null;
  }
};

/**
 * Update a user's profile with proper RLS compliance
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
    console.log("Updating profile for user:", userId, "with data:", profileData);
    
    // Add timestamp
    const dataWithTimestamp = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    // Use upsert to handle both insert and update cases
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...dataWithTimestamp,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
      
    if (error) {
      console.error("Error upserting profile:", error);
      throw error;
    }
    
    console.log("Profile upserted successfully");
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
 * Get a user's profile with proper RLS compliance
 */
export const getUserProfile = async (userId: string) => {
  try {
    console.log("Getting profile for user:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
    
    console.log("Profile retrieved successfully:", data);
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
