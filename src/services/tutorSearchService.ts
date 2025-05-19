
import { supabase } from "@/integrations/supabase/client";
import { ensureObject, ensureSingleObject } from "@/utils/supabaseUtils";

export interface TutorSearchResult {
  id: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  city: string | null;
  rating: number | null;
  subjects: {
    id: string;
    name: string;
    hourlyRate: number;
  }[];
  isVerified: boolean;
  experience: number | null;
  relationshipStatus?: string | null;
  isFavorite?: boolean;
}

export interface TutorSearchFilters {
  subject?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  rating?: number;
  verified?: boolean;
  experienceMin?: number;
  showExisting?: boolean; // New filter to control showing tutors already in relationships
}

/**
 * Check if tutor has added any subjects
 * @param tutorId - Tutor's ID
 * @returns Promise<boolean> - Whether the tutor has added subjects
 */
export const hasTutorAddedSubjects = async (tutorId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('tutor_subjects')
      .select('id')
      .eq('tutor_id', tutorId)
      .limit(1);
    
    if (error) {
      console.error("Error checking tutor subjects:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error("Exception checking tutor subjects:", err);
    return false;
  }
};

export const searchTutors = async (
  filters: TutorSearchFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{ tutors: TutorSearchResult[]; total: number }> => {
  try {
    // Get the current user ID for relationship and favorites checks
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;
    
    // Basic query to fetch published tutors
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        last_name,
        avatar_url,
        city,
        tutor_profiles!inner (
          is_published,
          experience,
          education_verified
        )
        `,
        { count: "exact" }
      )
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true);

    // Apply filters
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.verified) {
      query = query.eq("tutor_profiles.education_verified", true);
    }

    if (filters.experienceMin) {
      query = query.gte("tutor_profiles.experience", filters.experienceMin);
    }

    // Execute the query
    const { data: tutorsData, error, count } = await query;

    if (error) {
      console.error("Error searching tutors:", error);
      return { tutors: [], total: 0 };
    }

    if (!tutorsData || tutorsData.length === 0) {
      return { tutors: [], total: 0 };
    }

    // Get student-tutor relationships if a user is logged in
    let relationships: Record<string, string> = {};
    let favorites: Record<string, boolean> = {};
    
    if (currentUserId) {
      const { data: relationshipsData } = await supabase
        .from('student_tutor_relationships')
        .select('tutor_id, status')
        .eq('student_id', currentUserId);
      
      if (relationshipsData) {
        relationships = relationshipsData.reduce((acc, rel) => {
          acc[rel.tutor_id] = rel.status;
          return acc;
        }, {} as Record<string, string>);
      }
      
      const { data: favoritesData } = await supabase
        .from('favorite_tutors')
        .select('tutor_id')
        .eq('student_id', currentUserId);
      
      if (favoritesData) {
        favorites = favoritesData.reduce((acc, fav) => {
          acc[fav.tutor_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    }

    // Process tutor results
    const tutorPromises = tutorsData.map(async (tutor) => {
      // Skip tutors that are already in a relationship with the student,
      // unless specifically showing existing relationships
      if (currentUserId && relationships[tutor.id] === 'accepted' && !filters.showExisting) {
        return null;
      }
      
      // Get subjects with proper error handling
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select(`
          subject_id,
          hourly_rate,
          subjects:subject_id (
            id, name
          )
        `)
        .eq("tutor_id", tutor.id);

      if (subjectsError) {
        console.error(`Error fetching subjects for tutor ${tutor.id}:`, subjectsError);
        return null;
      }

      // Filter subjects based on subject filter
      let filteredSubjects = subjectsData;
      if (filters.subject) {
        const { data: subjectInfo } = await supabase
          .from("subjects")
          .select("id")
          .eq("name", filters.subject)
          .single();

        if (subjectInfo) {
          filteredSubjects = subjectsData.filter(
            (s) => s.subject_id === subjectInfo.id
          );
          if (filteredSubjects.length === 0) return null; // Skip this tutor if they don't teach the subject
        }
      }

      // Filter by price range
      if (
        (filters.priceMin !== undefined || filters.priceMax !== undefined) &&
        filteredSubjects.length > 0
      ) {
        filteredSubjects = filteredSubjects.filter((s) => {
          const price = typeof s.hourly_rate === 'number' && s.hourly_rate > 0 ? s.hourly_rate : 0;
          return (
            (filters.priceMin === undefined || price >= filters.priceMin) &&
            (filters.priceMax === undefined || price <= filters.priceMax)
          );
        });
        
        if (filteredSubjects.length === 0) return null; // Skip if no subjects in price range
      }

      // Get ratings
      const { data: ratingsData } = await supabase
        .from("tutor_reviews")
        .select("rating")
        .eq("tutor_id", tutor.id);

      let averageRating = null;
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, item) => acc + item.rating, 0);
        averageRating = sum / ratingsData.length;
      }

      // Filter by rating
      if (
        filters.rating !== undefined &&
        (averageRating === null || averageRating < filters.rating)
      ) {
        return null;
      }

      // Format the subject data with proper error handling
      const formattedSubjects = filteredSubjects.map((item) => {
        try {
          const subject = ensureSingleObject(item.subjects);
          return {
            id: subject.id || 'unknown',
            name: subject.name || 'Неизвестный предмет',
            hourlyRate: typeof item.hourly_rate === 'number' && item.hourly_rate > 0 
              ? item.hourly_rate 
              : 0,
          };
        } catch (error) {
          console.error("Error formatting subject:", error);
          return {
            id: 'unknown',
            name: 'Ошибка загрузки',
            hourlyRate: 0
          };
        }
      });

      // Get tutor profile data
      const tutorProfile = ensureSingleObject(tutor.tutor_profiles);
      
      // Generate avatar URL with cache-busting
      const avatarUrl = tutor.avatar_url 
        ? `${tutor.avatar_url}?t=${Date.now()}`
        : null;

      return {
        id: tutor.id,
        firstName: tutor.first_name || '',
        lastName: tutor.last_name || '',
        avatarUrl: avatarUrl,
        city: tutor.city || '',
        rating: averageRating,
        subjects: formattedSubjects,
        isVerified: tutorProfile.education_verified || false,
        experience: typeof tutorProfile.experience === 'number' ? tutorProfile.experience : 0,
        // Add relationship status and favorite status if applicable
        relationshipStatus: currentUserId ? relationships[tutor.id] : undefined,
        isFavorite: currentUserId ? !!favorites[tutor.id] : undefined
      } as TutorSearchResult;
    });

    let results = (await Promise.all(tutorPromises)).filter(Boolean) as TutorSearchResult[];
    
    // Apply pagination after all filters
    const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

    return { 
      tutors: paginatedResults, 
      total: results.length 
    };
  } catch (error) {
    console.error("Error in searchTutors:", error);
    return { tutors: [], total: 0 };
  }
};
