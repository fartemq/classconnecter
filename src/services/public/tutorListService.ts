
import { supabase } from "@/integrations/supabase/client";
import { PublicTutorProfile } from "./types";

/**
 * Fetches a simple list of tutors (basic version)
 */
export const fetchTutorsList = async (): Promise<PublicTutorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id, 
        first_name, 
        last_name, 
        avatar_url,
        city,
        tutor_profiles!inner(is_published)
      `)
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true)
      .limit(10);
      
    if (error) {
      console.error("Error fetching tutors list:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform data into expected format
    return data.map(profile => {
      return {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url,
        city: profile.city || '',
        bio: null,
        rating: 4.5, // Default rating
        experience: null,
        isVerified: false,
        education_institution: null,
        degree: null,
        methodology: null,
        subjects: []
      };
    });
  } catch (error) {
    console.error("Error in fetchTutorsList:", error);
    return [];
  }
};
