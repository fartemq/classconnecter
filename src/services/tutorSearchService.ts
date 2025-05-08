
import { supabase } from "@/integrations/supabase/client";
import { ensureObject } from "@/utils/supabaseUtils";

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
}

export interface TutorSearchFilters {
  subject?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  rating?: number;
  verified?: boolean;
  experienceMin?: number;
}

export const searchTutors = async (
  filters: TutorSearchFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<{ tutors: TutorSearchResult[]; total: number }> => {
  try {
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
      .eq("tutor_profiles.is_published", true)
      .range((page - 1) * pageSize, page * pageSize - 1);

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

    // Process tutor results
    const tutorPromises = tutorsData.map(async (tutor) => {
      // Get subjects
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
          const price = s.hourly_rate || 0;
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

      // Format the subject data
      const formattedSubjects = filteredSubjects.map((item) => {
        const subject = ensureObject(item.subjects);
        return {
          id: subject.id,
          name: subject.name,
          hourlyRate: item.hourly_rate,
        };
      });

      const tutorProfile = ensureObject(tutor.tutor_profiles);

      return {
        id: tutor.id,
        firstName: tutor.first_name,
        lastName: tutor.last_name,
        avatarUrl: tutor.avatar_url,
        city: tutor.city,
        rating: averageRating,
        subjects: formattedSubjects,
        isVerified: tutorProfile.education_verified || false,
        experience: tutorProfile.experience || 0,
      };
    });

    const results = (await Promise.all(tutorPromises)).filter(
      (t): t is TutorSearchResult => t !== null
    );

    return { 
      tutors: results, 
      total: count || results.length 
    };
  } catch (error) {
    console.error("Error in searchTutors:", error);
    return { tutors: [], total: 0 };
  }
};
