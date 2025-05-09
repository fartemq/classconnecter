import { supabase } from "@/integrations/supabase/client";
import { ensureObject, ensureSingleObject } from "@/utils/supabaseUtils";

export interface PublicTutorProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  education_institution: string | null;
  degree: string | null;
  experience: number | null;
  methodology: string | null;
  video_url: string | null;
  subjects: {
    id: string;
    name: string;
    hourlyRate: number;
  }[];
  rating: number | null;
  isVerified: boolean;
}

export interface TutorSearchFilters {
  subject?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  minRating?: number;
  experienceYears?: number;
  searchQuery?: string;
}

export const fetchPublicTutors = async (filters?: TutorSearchFilters): Promise<PublicTutorProfile[]> => {
  try {
    // Get published tutors
    let query = supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city,
        tutor_profiles!inner (
          is_published,
          education_institution,
          degree,
          experience,
          methodology,
          video_url,
          education_verified
        )
      `)
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true);
    
    // Apply city filter if provided
    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    
    // Apply experience filter if provided
    if (filters?.experienceYears) {
      query = query.gte("tutor_profiles.experience", filters.experienceYears);
    }
    
    // Apply text search filter if provided
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},bio.ilike.${searchTerm}`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get subjects, ratings, etc. for each tutor
    const tutorsWithDetails = await Promise.all(data.map(async (tutor) => {
      // Get subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select(`
          id,
          hourly_rate,
          subject:subject_id (
            id,
            name
          )
        `)
        .eq("tutor_id", tutor.id);
        
      if (subjectsError) {
        console.error("Error fetching subjects for tutor", tutor.id, subjectsError);
        return null;
      }
      
      // Map subjects
      const subjects = (subjectsData || []).map(item => {
        const subject = ensureSingleObject(item.subject);
        const subjectData = {
          id: subject.id,
          name: subject.name
        };
        return {
          id: subjectData.id,
          name: subjectData.name,
          hourlyRate: item.hourly_rate || 0
        };
      });
      
      // Apply subject filter if provided
      if (filters?.subject && !subjects.some(s => s.name.toLowerCase().includes(filters.subject!.toLowerCase()))) {
        return null;
      }
      
      // Apply price filters if provided
      if (
        (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) &&
        subjects.length > 0
      ) {
        const hasSubjectInRange = subjects.some(s => {
          const price = s.hourlyRate;
          return (
            (filters.minPrice === undefined || price >= filters.minPrice) &&
            (filters.maxPrice === undefined || price <= filters.maxPrice)
          );
        });
        
        if (!hasSubjectInRange) {
          return null;
        }
      }
      
      // Get ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("tutor_reviews")
        .select("rating")
        .eq("tutor_id", tutor.id);
        
      if (ratingsError) {
        console.error("Error fetching ratings for tutor", tutor.id, ratingsError);
      }
      
      let rating = null;
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, item) => acc + item.rating, 0);
        rating = sum / ratingsData.length;
      }
      
      // Apply rating filter if provided
      if (filters?.minRating !== undefined && (rating === null || rating < filters.minRating)) {
        return null;
      }
      
      const tutorProfile = ensureSingleObject(tutor.tutor_profiles);
      const tutorProfileData = {
        education_institution: tutorProfile.education_institution || null,
        degree: tutorProfile.degree || null,
        experience: tutorProfile.experience || null,
        methodology: tutorProfile.methodology || null,
        video_url: tutorProfile.video_url || null,
        education_verified: tutorProfile.education_verified || false
      };
      
      return {
        id: tutor.id,
        first_name: tutor.first_name,
        last_name: tutor.last_name,
        avatar_url: tutor.avatar_url,
        bio: tutor.bio,
        city: tutor.city,
        education_institution: tutorProfileData.education_institution || null,
        degree: tutorProfileData.degree || null,
        experience: tutorProfileData.experience || null,
        methodology: tutorProfileData.methodology || null,
        video_url: tutorProfileData.video_url || null,
        subjects,
        rating,
        isVerified: tutorProfileData.education_verified || false
      };
    }));
    
    // Filter out null results from our filtering above
    return tutorsWithDetails.filter(Boolean) as PublicTutorProfile[];
  } catch (error) {
    console.error("Error fetching public tutors:", error);
    return [];
  }
};

export const fetchPublicTutorById = async (tutorId: string): Promise<PublicTutorProfile | null> => {
  try {
    // Get tutor base profile
    const { data: tutor, error } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city,
        tutor_profiles!inner (
          is_published,
          education_institution,
          degree,
          experience,
          methodology,
          video_url,
          education_verified
        )
      `)
      .eq("id", tutorId)
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - tutor not found or not published
        return null;
      }
      throw error;
    }
    
    if (!tutor) {
      return null;
    }
    
    // Get subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        id,
        hourly_rate,
        subject:subject_id (
          id,
          name
        )
      `)
      .eq("tutor_id", tutorId);
    
    if (subjectsError) throw subjectsError;
    
    const subjects = (subjectsData || []).map(item => {
      const subject = ensureSingleObject(item.subject);
      const subjectData = {
        id: subject.id,
        name: subject.name
      };
      return {
        id: subjectData.id,
        name: subjectData.name,
        hourlyRate: item.hourly_rate || 0
      };
    });
    
    // Get ratings
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("tutor_reviews")
      .select("rating")
      .eq("tutor_id", tutorId);
    
    if (ratingsError) throw ratingsError;
    
    let rating = null;
    if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc, item) => acc + item.rating, 0);
      rating = sum / ratingsData.length;
    }
    
    const tutorProfile = ensureSingleObject(tutor.tutor_profiles);
    const tutorProfileData = {
      education_institution: tutorProfile.education_institution || null,
      degree: tutorProfile.degree || null,
      experience: tutorProfile.experience || null,
      methodology: tutorProfile.methodology || null,
      video_url: tutorProfile.video_url || null,
      education_verified: tutorProfile.education_verified || false
    };
    
    return {
      id: tutor.id,
      first_name: tutor.first_name,
      last_name: tutor.last_name,
      avatar_url: tutor.avatar_url,
      bio: tutor.bio,
      city: tutor.city,
      education_institution: tutorProfileData.education_institution || null,
      degree: tutorProfileData.degree || null,
      experience: tutorProfileData.experience || null,
      methodology: tutorProfileData.methodology || null,
      video_url: tutorProfileData.video_url || null,
      subjects,
      rating,
      isVerified: tutorProfileData.education_verified || false
    };
  } catch (error) {
    console.error("Error fetching public tutor by ID:", error);
    return null;
  }
};
