
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Fetches user role from the profiles table
 * If no profile exists, creates one with default role based on user metadata
 */
export const fetchUserRole = async (user: User | null): Promise<string | null> => {
  if (!user) return null;
  
  try {
    // Try to get existing profile
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle(); 
    
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    // If profile exists, return role
    if (data && data.role) {
      console.log("User role found:", data.role);
      return data.role;
    }
    
    // If profile exists but role is null, check metadata
    if (data && !data.role) {
      // Try to get role from metadata
      const metadataRole = user.user_metadata?.role;
      
      if (metadataRole) {
        console.log("Using role from metadata:", metadataRole);
        
        // Update profile with role from metadata
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: metadataRole })
          .eq("id", user.id);
          
        if (updateError) {
          console.error("Error updating profile with role from metadata:", updateError);
        }
        
        return metadataRole;
      }
    }
    
    // If no profile exists yet, create one with default role based on user metadata
    console.log("No profile found, creating one...");
    const defaultRole = user?.user_metadata?.role || 'student';
    console.log("Using default role from metadata:", defaultRole);
    
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([
        { 
          id: user.id, 
          role: defaultRole,
          first_name: user?.user_metadata?.first_name || '',
          last_name: user?.user_metadata?.last_name || '',
          created_at: new Date().toISOString()
        }
      ]);
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }
    
    // Also create role-specific profile
    try {
      if (defaultRole === 'tutor') {
        const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
          id: user.id,
          education_institution: "",
          degree: "",
          graduation_year: new Date().getFullYear(),
          experience: 0,
          is_published: false
        });
        
        if (tutorProfileError) {
          console.error("Error creating tutor profile:", tutorProfileError);
        }
      } else {
        const { error: studentProfileError } = await supabase.from("student_profiles").insert({
          id: user.id,
          educational_level: null,
          subjects: [],
          budget: null
        });
        
        if (studentProfileError) {
          console.error("Error creating student profile:", studentProfileError);
        }
      }
    } catch (profileError) {
      console.error("Error creating role-specific profile:", profileError);
    }
    
    // Return the default role
    return defaultRole;
  } catch (err) {
    console.error("Error in fetchUserRole:", err);
    return null;
  }
};
