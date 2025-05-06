
import { supabase } from "@/integrations/supabase/client";
import { TutorProfile } from "@/types/tutor";

export interface PublicTutorProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  education_institution: string | null;
  degree: string | null;
  graduation_year: number | null;
  methodology: string | null;
  experience: number | null;
  achievements: string | null;
  video_url: string | null;
  rating: number | null;
  subjects: {
    id: string;
    name: string;
    hourly_rate: number;
    experience_years: number | null;
    description: string | null;
  }[];
}

export const fetchPublicTutorById = async (tutorId: string): Promise<PublicTutorProfile | null> => {
  try {
    // Fetch basic profile information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", tutorId)
      .eq("role", "tutor")
      .single();
    
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return null;
    }
    
    // Fetch tutor specific information
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .maybeSingle();
    
    if (tutorProfileError) {
      console.error("Tutor profile fetch error:", tutorProfileError);
      return null;
    }
    
    // Fetch tutor subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        *,
        subjects:subject_id (
          id, name
        )
      `)
      .eq("tutor_id", tutorId);
    
    if (subjectsError) {
      console.error("Subjects fetch error:", subjectsError);
      return null;
    }
    
    const formattedSubjects = subjectsData ? subjectsData.map(item => ({
      id: item.subject_id,
      name: item.subjects.name,
      hourly_rate: item.hourly_rate,
      experience_years: item.experience_years,
      description: item.description
    })) : [];
    
    // Fetch average rating
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("tutor_reviews")
      .select("rating")
      .eq("tutor_id", tutorId);
      
    let averageRating = null;
    if (!ratingsError && ratingsData && ratingsData.length > 0) {
      const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0);
      averageRating = totalRating / ratingsData.length;
    }
    
    return {
      id: profileData.id,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
      city: profileData.city,
      education_institution: tutorProfileData?.education_institution || null,
      degree: tutorProfileData?.degree || null,
      graduation_year: tutorProfileData?.graduation_year || null,
      methodology: tutorProfileData?.methodology || null,
      experience: tutorProfileData?.experience || null,
      achievements: tutorProfileData?.achievements || null,
      video_url: tutorProfileData?.video_url || null,
      rating: averageRating,
      subjects: formattedSubjects
    };
  } catch (error) {
    console.error("Error fetching public tutor profile:", error);
    return null;
  }
};

export const fetchPublicTutors = async (filters: any = {}): Promise<PublicTutorProfile[]> => {
  try {
    // Start with the profiles that have role=tutor
    let query = supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city
      `)
      .eq("role", "tutor");

    const { data: profiles, error: profilesError } = await query;

    if (profilesError || !profiles || profiles.length === 0) {
      console.error("No tutor profiles found:", profilesError);
      return [];
    }

    // Get additional details for each tutor
    const tutors = await Promise.all(
      profiles.map(async (profile) => {
        const tutorProfile = await fetchPublicTutorById(profile.id);
        return tutorProfile;
      })
    );

    // Filter out any null results
    return tutors.filter(tutor => tutor !== null) as PublicTutorProfile[];
  } catch (error) {
    console.error("Error fetching public tutors:", error);
    return [];
  }
};
