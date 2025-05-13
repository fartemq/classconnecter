
import { supabase } from "@/integrations/supabase/client";

export interface PublicTutorProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  rating: number | null;
  experience: number | null;
  isVerified: boolean;
  education_institution: string | null;
  degree: string | null;
  methodology: string | null;
  subjects: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
}

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

/**
 * Fetches a list of public tutor profiles
 */
export const fetchPublicTutors = async (filters?: any): Promise<PublicTutorProfile[]> => {
  try {
    console.log("Fetching public tutors with filters:", filters);
    
    // First get profiles with role = tutor
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        city
      `)
      .eq("role", "tutor");
      
    if (profilesError) {
      console.error("Error fetching tutor profiles:", profilesError);
      return [];
    }
    
    if (!profilesData || profilesData.length === 0) {
      return [];
    }
    
    // Get tutor profile details
    const tutorIds = profilesData.map(profile => profile.id);
    
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select(`
        id,
        bio,
        experience,
        education_institution,
        degree,
        methodology,
        is_published
      `)
      .in("id", tutorIds)
      .eq("is_published", true);
      
    if (tutorError) {
      console.error("Error fetching tutor details:", tutorError);
    }
    
    const tutorMap = new Map();
    tutorData?.forEach((tutor: any) => {
      tutorMap.set(tutor.id, tutor);
    });
    
    // Get subjects for each tutor
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        tutor_id,
        hourly_rate,
        subjects:subject_id (id, name)
      `)
      .in("tutor_id", tutorIds)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
    }
    
    // Group subjects by tutor
    const subjectsMap = new Map();
    subjectsData?.forEach((item: any) => {
      if (!subjectsMap.has(item.tutor_id)) {
        subjectsMap.set(item.tutor_id, []);
      }
      
      subjectsMap.get(item.tutor_id).push({
        id: item.subjects.id,
        name: item.subjects.name,
        hourlyRate: item.hourly_rate || 0
      });
    });
    
    // Build public tutor profiles
    const publicProfiles: PublicTutorProfile[] = profilesData
      .filter(profile => tutorMap.has(profile.id))
      .map(profile => {
        const tutorInfo = tutorMap.get(profile.id);
        const subjects = subjectsMap.get(profile.id) || [];
        
        // Mock rating for now
        const rating = 4 + Math.random();
        
        return {
          id: profile.id,
          first_name: profile.first_name || "",
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          city: profile.city,
          bio: tutorInfo?.bio || null,
          rating: rating < 5 ? rating : 5,
          experience: tutorInfo?.experience || null,
          isVerified: true, // Mockup for now
          education_institution: tutorInfo?.education_institution || null,
          degree: tutorInfo?.degree || null,
          methodology: tutorInfo?.methodology || null,
          subjects: subjects
        };
      });
      
    console.log(`Successfully fetched ${publicProfiles.length} tutor profiles`);
    return publicProfiles;
    
  } catch (error) {
    console.error("Unexpected error fetching tutors:", error);
    return [];
  }
};
