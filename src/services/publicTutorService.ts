
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
    console.log("Fetching published tutor profiles...");
    
    // Get only published profiles from tutor_profiles
    const { data: tutorProfiles, error: tutorProfilesError } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("is_published", true);

    if (tutorProfilesError) {
      console.error("Error fetching published tutor profiles:", tutorProfilesError);
      return [];
    }
    
    console.log(`Found ${tutorProfiles?.length || 0} published tutor profiles`);
    
    if (!tutorProfiles || tutorProfiles.length === 0) {
      return [];
    }

    // Get IDs of published profiles
    const publishedTutorIds = tutorProfiles.map(profile => profile.id);
    
    // Get basic information for these tutors
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        city
      `)
      .eq("role", "tutor")
      .in("id", publishedTutorIds);

    if (profilesError) {
      console.error("Error fetching tutor basic profiles:", profilesError);
      return [];
    }
    
    if (!profiles || profiles.length === 0) {
      console.log("No matching profiles found for published tutor IDs");
      return [];
    }

    console.log(`Found ${profiles.length} matching basic profiles`);

    // Fetch additional information for each tutor
    const tutorsPromises = profiles.map(async (profile) => {
      // Fetch tutor-specific information
      const { data: tutorData, error: tutorError } = await supabase
        .from("tutor_profiles")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
        
      if (tutorError) {
        console.error(`Error fetching tutor data for ${profile.id}:`, tutorError);
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
        .eq("tutor_id", profile.id);
        
      if (subjectsError) {
        console.error(`Error fetching subjects for ${profile.id}:`, subjectsError);
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
        .eq("tutor_id", profile.id);
        
      let averageRating = null;
      if (!ratingsError && ratingsData && ratingsData.length > 0) {
        const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0);
        averageRating = totalRating / ratingsData.length;
      }
      
      return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        city: profile.city,
        education_institution: tutorData?.education_institution || null,
        degree: tutorData?.degree || null,
        graduation_year: tutorData?.graduation_year || null,
        methodology: tutorData?.methodology || null,
        experience: tutorData?.experience || null,
        achievements: tutorData?.achievements || null,
        video_url: tutorData?.video_url || null,
        rating: averageRating,
        subjects: formattedSubjects
      };
    });
    
    const tutorsResults = await Promise.all(tutorsPromises);
    // Filter out null values
    const tutors = tutorsResults.filter((tutor): tutor is PublicTutorProfile => tutor !== null);
    
    console.log(`Found ${tutors.length} complete tutor profiles to display`);
    return tutors;
  } catch (error) {
    console.error("Error in fetchPublicTutors:", error);
    return [];
  }
};
