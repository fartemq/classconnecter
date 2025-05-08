
import { supabase } from "@/integrations/supabase/client";
import { TutorProfile } from "@/types/tutor";
import { ensureObject } from "@/utils/supabaseUtils";

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
    
    // Fetch tutor specific information and check if published
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .eq("is_published", true) // Проверка на опубликованный профиль
      .maybeSingle();
    
    if (tutorProfileError || !tutorProfileData) {
      console.error("Tutor profile fetch error or profile not published:", tutorProfileError);
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
    
    const formattedSubjects = subjectsData ? subjectsData.map(item => {
      const subject = ensureObject(item.subjects);
      return {
        id: item.subject_id,
        name: subject.name,
        hourly_rate: item.hourly_rate,
        experience_years: item.experience_years,
        description: item.description
      };
    }) : [];
    
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
    
    const tutorProfile = ensureObject(tutorProfileData);

    return {
      id: profileData.id,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      avatar_url: profileData.avatar_url,
      bio: profileData.bio,
      city: profileData.city,
      education_institution: tutorProfile.education_institution || null,
      degree: tutorProfile.degree || null,
      graduation_year: tutorProfile.graduation_year || null,
      methodology: tutorProfile.methodology || null,
      experience: tutorProfile.experience || null,
      achievements: tutorProfile.achievements || null,
      video_url: tutorProfile.video_url || null,
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
    console.log("Fetching published tutor profiles with improved logic...");
    
    // Step 1: Join profiles and tutor_profiles to get published tutors in one query
    const { data: tutors, error: tutorsError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city,
        tutor_profiles!inner(
          is_published,
          education_institution,
          degree,
          graduation_year,
          methodology,
          experience,
          achievements,
          video_url
        )
      `)
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true);
    
    if (tutorsError) {
      console.error("Error fetching published tutors:", tutorsError);
      return [];
    }
    
    console.log(`Found ${tutors?.length || 0} published tutor profiles`);
    
    if (!tutors || tutors.length === 0) {
      return [];
    }

    // Step 2: Process the results to match our expected format
    const tutorPromises = tutors.map(async (tutor) => {
      // Extract the tutor profile data
      const tutorProfileData = ensureObject(tutor.tutor_profiles);
      
      // Fetch tutor subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select(`
          *,
          subjects:subject_id (
            id, name
          )
        `)
        .eq("tutor_id", tutor.id);
        
      if (subjectsError) {
        console.error(`Error fetching subjects for ${tutor.id}:`, subjectsError);
        return null;
      }
      
      const formattedSubjects = subjectsData ? subjectsData.map(item => {
        const subjectObj = ensureObject(item.subjects);
        return {
          id: item.subject_id,
          name: subjectObj.name,
          hourly_rate: item.hourly_rate,
          experience_years: item.experience_years,
          description: item.description
        };
      }) : [];
      
      // Fetch average rating
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("tutor_reviews")
        .select("rating")
        .eq("tutor_id", tutor.id);
        
      let averageRating = null;
      if (!ratingsError && ratingsData && ratingsData.length > 0) {
        const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0);
        averageRating = totalRating / ratingsData.length;
      }
      
      return {
        id: tutor.id,
        first_name: tutor.first_name,
        last_name: tutor.last_name,
        avatar_url: tutor.avatar_url,
        bio: tutor.bio,
        city: tutor.city,
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
    });
    
    const tutorsResults = await Promise.all(tutorPromises);
    // Filter out null values
    const result = tutorsResults.filter((tutor): tutor is PublicTutorProfile => tutor !== null);
    
    console.log(`Final processed tutor profiles count: ${result.length}`);
    return result;
  } catch (error) {
    console.error("Error in fetchPublicTutors:", error);
    return [];
  }
};
