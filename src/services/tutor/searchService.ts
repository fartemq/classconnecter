import { supabase } from "@/integrations/supabase/client";
import { ensureSingleObject } from "@/utils/supabaseUtils";
import { TutorSearchFilters, TutorSearchResult } from "./types";

/**
 * Get user relationships and favorites for filtering search results
 */
const getUserRelationsData = async (userId: string | undefined) => {
  if (!userId) {
    return { relationships: {}, favorites: {} };
  }
  
  // Get student-tutor relationships
  const { data: relationshipsData } = await supabase
    .from('student_tutor_relationships')
    .select('tutor_id, status')
    .eq('student_id', userId);
  
  const relationships = relationshipsData
    ? relationshipsData.reduce((acc, rel) => {
        acc[rel.tutor_id] = rel.status;
        return acc;
      }, {} as Record<string, string>)
    : {};
  
  // Get favorites
  const { data: favoritesData } = await supabase
    .from('favorite_tutors')
    .select('tutor_id')
    .eq('student_id', userId);
  
  const favorites = favoritesData
    ? favoritesData.reduce((acc, fav) => {
        acc[fav.tutor_id] = true;
        return acc;
      }, {} as Record<string, boolean>)
    : {};

  return { relationships, favorites };
};

/**
 * Filter tutors by subject and build formatted subject data
 */
const processSubjects = async (
  tutor: any, 
  filters: TutorSearchFilters
) => {
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
    .eq("tutor_id", tutor.id)
    .eq("is_active", true);

  if (subjectsError) {
    console.error(`Error fetching subjects for tutor ${tutor.id}:`, subjectsError);
    return null;
  }

  // Filter subjects based on subject filter
  let filteredSubjects = subjectsData;
  if (filters.subject) {
    // Try to find subject ID from name
    const { data: subjectInfo } = await supabase
      .from("subjects")
      .select("id")
      .ilike("name", `%${filters.subject}%`)
      .maybeSingle();

    if (subjectInfo) {
      filteredSubjects = subjectsData.filter(
        (s) => s.subject_id === subjectInfo.id
      );
      if (filteredSubjects.length === 0) return null; // Skip this tutor if they don't teach the subject
    }
  }

  // Filter by price range
  if ((filters.priceMin !== undefined || filters.priceMax !== undefined) && filteredSubjects.length > 0) {
    filteredSubjects = filteredSubjects.filter((s) => {
      const price = typeof s.hourly_rate === 'number' && s.hourly_rate > 0 ? s.hourly_rate : 0;
      return (
        (filters.priceMin === undefined || price >= filters.priceMin) &&
        (filters.priceMax === undefined || price <= filters.priceMax)
      );
    });
    
    if (filteredSubjects.length === 0) return null; // Skip if no subjects in price range
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

  return formattedSubjects;
};

/**
 * Calculate tutor's average rating
 */
const calculateTutorRating = async (tutorId: string) => {
  const { data: ratingsData } = await supabase
    .from("tutor_reviews")
    .select("rating")
    .eq("tutor_id", tutorId);

  let averageRating = null;
  if (ratingsData && ratingsData.length > 0) {
    const sum = ratingsData.reduce((acc, item) => acc + item.rating, 0);
    averageRating = sum / ratingsData.length;
  }
  
  return averageRating;
};

/**
 * Search for tutors with various filters
 */
export const searchTutors = async (
  filters: TutorSearchFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{ tutors: TutorSearchResult[]; total: number }> => {
  try {
    console.log("Searching tutors with filters:", filters);
    
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
    
    console.log("Search query result:", { tutorsData, error, count });

    if (error) {
      console.error("Error searching tutors:", error);
      return { tutors: [], total: 0 };
    }

    if (!tutorsData || tutorsData.length === 0) {
      console.log("No tutors found matching filters");
      return { tutors: [], total: 0 };
    }

    // Get relationships and favorites data for the current user
    const { relationships, favorites } = await getUserRelationsData(currentUserId);

    // Process tutor results
    const tutorPromises = tutorsData.map(async (tutor) => {
      // Skip tutors that are already in a relationship with the student,
      // unless specifically showing existing relationships
      if (currentUserId && relationships[tutor.id] === 'accepted' && !filters.showExisting) {
        return null;
      }
      
      // Process and filter subjects
      const formattedSubjects = await processSubjects(tutor, filters);
      if (formattedSubjects === null || formattedSubjects.length === 0) {
        return null; // Skip this tutor if subjects don't match filters
      }

      // Get ratings and filter by rating
      const averageRating = await calculateTutorRating(tutor.id);
      if (filters.rating !== undefined && (averageRating === null || averageRating < filters.rating)) {
        return null; // Skip if rating doesn't meet filter criteria
      }

      // Get tutor profile data
      const tutorProfile = ensureSingleObject(tutor.tutor_profiles);
      
      // Generate avatar URL with cache-busting
      const avatarUrl = tutor.avatar_url 
        ? `${tutor.avatar_url}?t=${Date.now()}`
        : null;

      const result = {
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
      
      return result;
    });

    let results = (await Promise.all(tutorPromises)).filter(Boolean) as TutorSearchResult[];
    
    console.log(`Found ${results.length} tutors after filtering`);
    
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
