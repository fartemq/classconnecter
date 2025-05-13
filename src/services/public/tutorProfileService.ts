
import { supabase } from "@/integrations/supabase/client";
import { PublicTutorProfile } from "./types";

/**
 * Fetches the public profile of a tutor by ID
 */
export const fetchPublicTutorById = async (id: string): Promise<PublicTutorProfile | null> => {
  try {
    console.log("Fetching public tutor profile with ID:", id);
    
    // First get the basic profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        city,
        role
      `)
      .eq("id", id)
      .eq("role", "tutor")
      .single();
      
    if (profileError) {
      console.error("Error fetching tutor profile:", profileError);
      return null;
    }
    
    if (!profileData) {
      console.error("No tutor found with ID:", id);
      return null;
    }
    
    // Then get the tutor-specific information
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select(`
        bio,
        experience,
        education_institution,
        degree,
        methodology,
        is_published
      `)
      .eq("id", id)
      .single();
      
    if (tutorError) {
      console.error("Error fetching tutor details:", tutorError);
    }
    
    // Get tutor subjects with hourly rates
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        id,
        subject_id,
        hourly_rate,
        subjects:subject_id (id, name)
      `)
      .eq("tutor_id", id)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
    }
    
    // Format subjects data
    const subjects = subjectsData ? subjectsData.map((item: any) => ({
      id: item.subjects.id,
      name: item.subjects.name,
      hourlyRate: item.hourly_rate || 0
    })) : [];
    
    // Mock rating for now (in real app would come from reviews)
    const rating = 4 + Math.random();
    
    // Build the public tutor profile
    const tutorProfile: PublicTutorProfile = {
      id: profileData.id,
      first_name: profileData.first_name || "",
      last_name: profileData.last_name,
      avatar_url: profileData.avatar_url,
      city: profileData.city,
      bio: tutorData?.bio || null,
      rating: rating < 5 ? rating : 5,
      experience: tutorData?.experience || null,
      isVerified: true, // Mockup for now
      education_institution: tutorData?.education_institution || null,
      degree: tutorData?.degree || null,
      methodology: tutorData?.methodology || null,
      subjects: subjects
    };
    
    console.log("Successfully fetched tutor profile:", tutorProfile);
    return tutorProfile;
    
  } catch (error) {
    console.error("Unexpected error fetching tutor profile:", error);
    return null;
  }
};
