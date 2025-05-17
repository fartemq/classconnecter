
import { supabase } from "@/integrations/supabase/client";
import { TutorProfile } from "@/types/tutor";

/**
 * Fetch a tutor's profile information
 */
export const fetchTutorProfile = async (tutorId: string): Promise<TutorProfile | null> => {
  try {
    console.log("Fetching tutor profile for:", tutorId);
    
    // Fetch base profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", tutorId)
      .eq("role", "tutor")
      .single();
      
    if (profileError) {
      console.error("Error fetching tutor base profile:", profileError);
      return null;
    }
    
    console.log("Base profile fetched:", profileData);
    
    // Fetch tutor-specific data
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor-specific data:", tutorError);
    }
    
    console.log("Tutor-specific data fetched:", tutorData);
    
    // If no tutor profile exists yet, create minimal data
    const tutorProfile = tutorData || {
      education_institution: "",
      degree: "",
      graduation_year: new Date().getFullYear(),
      is_published: false,
      education_verified: false,
      methodology: "",
      experience: 0,
      achievements: "",
      video_url: ""
    };
    
    // Fetch tutor subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        id,
        hourly_rate,
        experience_years,
        description,
        subject_id,
        subjects:subject_id (name)
      `)
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    if (subjectsError) {
      console.error("Error fetching tutor subjects:", subjectsError);
    }
    
    console.log("Tutor subjects fetched:", subjectsData || []);
    
    // Transform subjects data to match TutorSubject type
    const subjects = (subjectsData || []).map(item => {
      // Fix the type issue by properly checking and accessing the subjects property
      let subjectName = "";
      if (item.subjects && typeof item.subjects === 'object' && 'name' in item.subjects) {
        subjectName = item.subjects.name as string;
      }
      
      return {
        id: item.id,
        name: subjectName,
        hourlyRate: item.hourly_rate || 0,
        experienceYears: item.experience_years || undefined,
        description: item.description || undefined
      };
    });
    
    // Add a cache-busting parameter to the avatar URL
    const avatarUrl = profileData.avatar_url 
      ? `${profileData.avatar_url}?t=${Date.now()}`
      : undefined;
    
    // Combine data and map to TutorProfile type
    return {
      id: profileData.id,
      firstName: profileData.first_name || "",
      lastName: profileData.last_name || "",
      bio: profileData.bio || "",
      city: profileData.city || "",
      avatarUrl: avatarUrl,
      educationInstitution: tutorProfile.education_institution || "",
      degree: tutorProfile.degree || "",
      graduationYear: tutorProfile.graduation_year || new Date().getFullYear(),
      educationVerified: tutorProfile.education_verified || false,
      methodology: tutorProfile.methodology || undefined,
      experience: tutorProfile.experience || undefined,
      achievements: tutorProfile.achievements || undefined,
      videoUrl: tutorProfile.video_url || undefined,
      subjects: subjects,
      isPublished: tutorProfile.is_published || false
    };
  } catch (error) {
    console.error("Error in fetchTutorProfile:", error);
    return null;
  }
};
