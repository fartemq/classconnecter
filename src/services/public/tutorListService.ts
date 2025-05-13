
import { supabase } from "@/integrations/supabase/client";
import { PublicTutorProfile } from "./types";

/**
 * Fetches a list of public tutor profiles
 */
export const fetchTutorsList = async (filters?: any): Promise<PublicTutorProfile[]> => {
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

/**
 * Fetches a list of tutors for the public listing
 */
export const fetchPublicTutors = async (
  page: number = 1, 
  pageSize: number = 5, 
  filters?: any
): Promise<{ tutors: PublicTutorProfile[], totalCount: number }> => {
  try {
    const tutors = await fetchTutorsList(filters);
    return {
      tutors,
      totalCount: tutors.length
    };
  } catch (error) {
    console.error("Error fetching public tutors:", error);
    return { tutors: [], totalCount: 0 };
  }
};
