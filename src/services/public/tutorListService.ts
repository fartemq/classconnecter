
import { supabase } from "@/integrations/supabase/client";
import { PublicTutorProfile } from "./types";

/**
 * Fetches a simplified list of tutors (without pagination)
 */
export const fetchTutorsList = async (limit: number = 10): Promise<PublicTutorProfile[]> => {
  try {
    // Query to get only published tutor profiles
    const { data: tutorProfiles, error } = await supabase
      .from("profiles")
      .select(`
        id, 
        first_name, 
        last_name, 
        avatar_url,
        city,
        bio,
        tutor_profiles!inner(is_published, experience, education_verified)
      `)
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true)
      .limit(limit);
    
    if (error) {
      console.error("Error fetching tutors list:", error);
      return [];
    }
    
    if (!tutorProfiles || tutorProfiles.length === 0) {
      return [];
    }
    
    // Get subjects for all tutors in one query
    const tutorIds = tutorProfiles.map(tutor => tutor.id);
    const { data: allSubjects } = await supabase
      .from("tutor_subjects")
      .select(`
        subject_id,
        hourly_rate,
        tutor_id,
        subjects:subject_id(id, name)
      `)
      .in("tutor_id", tutorIds)
      .eq("is_active", true);
    
    // Map subjects to their respective tutors
    const tutorSubjectsMap: Record<string, any[]> = {};
    
    allSubjects?.forEach(subjectEntry => {
      const tutorId = subjectEntry.tutor_id;
      
      if (!tutorSubjectsMap[tutorId]) {
        tutorSubjectsMap[tutorId] = [];
      }
      
      // Safely get the subject info
      const subjectObj = subjectEntry.subjects as { id: string, name: string } | null;
      const subjectName = subjectObj ? subjectObj.name : '';
      
      tutorSubjectsMap[tutorId].push({
        id: subjectEntry.subject_id,
        name: subjectName,
        hourlyRate: subjectEntry.hourly_rate || 0
      });
    });
    
    // Generate tutors with all required data
    const tutors = tutorProfiles.map(profile => {
      // Generate random rating for demo purposes
      const rating = 3.5 + Math.random() * 1.5;
      
      // Safely work with tutor_profiles array
      const tutorProfileData = profile.tutor_profiles as any;
      const tutorProfile = tutorProfileData && Array.isArray(tutorProfileData) && tutorProfileData.length > 0
        ? tutorProfileData[0]
        : { experience: null, education_verified: false };
      
      // Add a parameter to the avatar URL to avoid caching
      const avatarUrlWithParam = profile.avatar_url 
        ? `${profile.avatar_url}?${Math.random().toString(36).substring(7)}`
        : null;
      
      return {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: avatarUrlWithParam,
        city: profile.city || '',
        bio: profile.bio || null,
        rating: rating < 5 ? rating : 5,
        experience: tutorProfile.experience || null,
        isVerified: tutorProfile.education_verified || false,
        education_institution: null,
        degree: null,
        methodology: null,
        // Ensure we're setting the subjects array properly
        subjects: tutorSubjectsMap[profile.id] || []
      };
    });
    
    return tutors;
  } catch (error) {
    console.error("Error fetching tutors list:", error);
    return [];
  }
};
