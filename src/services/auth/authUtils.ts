
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch the user's role from the profiles table using the security definer function
 */
export const fetchUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching role for user using security definer function:", userId);
    
    // Use the security definer function to get user role
    const { data, error } = await supabase.rpc('get_current_user_role');
    
    if (error) {
      console.error("Error fetching role via RPC:", error);
      
      // Fallback to direct query if RPC fails
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
        
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
 * Create a profile manually if it doesn't exist
 */
export const createProfileManually = async (userId: string, userData: any) => {
  try {
    console.log("Creating profile manually for user:", userId, userData);
    
    // First create the main profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: userData.role || 'student',
        city: userData.city || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error("Error creating main profile:", profileError);
      throw profileError;
    }

    // Create role-specific profile
    if (userData.role === 'student') {
      const { error: studentError } = await supabase
        .from("student_profiles")
        .upsert({
          id: userId,
          educational_level: null,
          subjects: [],
          learning_goals: null,
          preferred_format: [],
          school: null,
          grade: null,
          budget: 1000
        }, {
          onConflict: 'id'
        });

      if (studentError) {
        console.error("Error creating student profile:", studentError);
      }
    } else if (userData.role === 'tutor') {
      const { error: tutorError } = await supabase
        .from("tutor_profiles")
        .upsert({
          id: userId,
          education_institution: '',
          degree: '',
          graduation_year: new Date().getFullYear(),
          experience: 0,
          methodology: null,
          achievements: null,
          video_url: null,
          is_published: false,
          education_verified: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (tutorError) {
        console.error("Error creating tutor profile:", tutorError);
      }
    }

    console.log("Profile created manually successfully");
    return true;
  } catch (error) {
    console.error("Error in createProfileManually:", error);
    return false;
  }
};
