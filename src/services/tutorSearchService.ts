
import { supabase } from "@/integrations/supabase/client";

export interface TutorSearchResult {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  experience: number | null;
  rating: number | null;
  subjects: {
    id: string;
    name: string;
    hourly_rate: number;
    experience_years: number | null;
  }[];
}

export const searchTutors = async (filters: {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  subjectId?: string;
  city?: string;
} = {}): Promise<TutorSearchResult[]> => {
  try {
    console.log("Searching for tutors with filters:", filters);
    
    // First, fetch all published tutor profiles
    const { data: publishedTutors, error: profileError } = await supabase
      .from("tutor_profiles")
      .select(`
        id,
        is_published,
        experience
      `)
      .eq("is_published", true);
    
    if (profileError) {
      console.error("Error fetching published tutor profiles:", profileError);
      return [];
    }
    
    console.log(`Found ${publishedTutors?.length || 0} published tutor profiles`);
    
    if (!publishedTutors || publishedTutors.length === 0) {
      return [];
    }
    
    // Get the IDs of published tutors
    const tutorIds = publishedTutors.map(tutor => tutor.id);
    
    // Now get the full profile information for these tutors
    const { data: tutorProfiles, error: tutorProfileError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city
      `)
      .in("id", tutorIds)
      .eq("role", "tutor");
    
    if (tutorProfileError || !tutorProfiles) {
      console.error("Error fetching tutor profiles:", tutorProfileError);
      return [];
    }
    
    // Map tutor profiles with their published profile data
    const tutors = tutorProfiles.map(profile => {
      const publishedData = publishedTutors.find(t => t.id === profile.id);
      
      return {
        ...profile,
        experience: publishedData?.experience || null,
      };
    });
    
    // Fetch subjects and ratings for all tutors in parallel
    const tutorResults = await Promise.all(
      tutors.map(async (tutor) => {
        // Fetch subjects for this tutor
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("tutor_subjects")
          .select(`
            subject_id,
            hourly_rate,
            experience_years,
            subjects:subject_id (
              id, name
            )
          `)
          .eq("tutor_id", tutor.id)
          .eq("is_active", true);
        
        if (subjectsError) {
          console.error(`Error fetching subjects for tutor ${tutor.id}:`, subjectsError);
          return null;
        }
        
        const subjects = (subjectsData || []).map(item => ({
          id: item.subject_id,
          name: item.subjects?.name || "",
          hourly_rate: item.hourly_rate,
          experience_years: item.experience_years
        }));
        
        // Fetch average rating
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("tutor_reviews")
          .select("rating")
          .eq("tutor_id", tutor.id);
        
        let rating = null;
        if (!ratingsError && ratingsData && ratingsData.length > 0) {
          const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0);
          rating = totalRating / ratingsData.length;
        }
        
        // Apply filters
        if (filters.subjectId && !subjects.some(s => s.id === filters.subjectId)) {
          return null; // Filter out if subject doesn't match
        }
        
        if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
          const hasMatchingPrice = subjects.some(
            s => s.hourly_rate >= filters.minPrice! && s.hourly_rate <= filters.maxPrice!
          );
          
          if (!hasMatchingPrice) return null; // Filter out if price doesn't match
        }
        
        if (filters.city && tutor.city?.toLowerCase() !== filters.city.toLowerCase()) {
          return null; // Filter out if city doesn't match
        }
        
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          const fullName = `${tutor.first_name} ${tutor.last_name || ''}`.toLowerCase();
          const subjectNames = subjects.map(s => s.name.toLowerCase()).join(' ');
          const cityMatch = tutor.city ? tutor.city.toLowerCase().includes(searchTerm) : false;
          
          // Filter out if no match in name, subjects, or city
          if (!fullName.includes(searchTerm) && !subjectNames.includes(searchTerm) && !cityMatch) {
            return null;
          }
        }
        
        return {
          id: tutor.id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          avatar_url: tutor.avatar_url,
          bio: tutor.bio,
          city: tutor.city,
          experience: tutor.experience,
          rating,
          subjects
        };
      })
    );
    
    // Filter out null results and return valid tutors
    return tutorResults.filter((tutor): tutor is TutorSearchResult => tutor !== null);
  } catch (error) {
    console.error("Error in searchTutors:", error);
    return [];
  }
};

// Function to verify if a tutor profile is published
export const isTutorProfilePublished = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .single();
    
    if (error) {
      console.error("Error checking tutor publish status:", error);
      return false;
    }
    
    return !!data?.is_published;
  } catch (error) {
    console.error("Error in isTutorProfilePublished:", error);
    return false;
  }
};

// Function to check if tutor has added subjects
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from("tutor_subjects")
      .select("*", { count: 'exact', head: true })
      .eq("tutor_id", tutorId);
    
    if (error) {
      console.error("Error checking tutor subjects:", error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error in hasTutorAddedSubjects:", error);
    return false;
  }
};
