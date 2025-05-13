
import { supabase } from "@/integrations/supabase/client";
import { PublicTutorProfile } from "./types";

/**
 * Fetches a tutor's public profile information by ID
 */
export const fetchPublicTutorById = async (tutorId: string): Promise<PublicTutorProfile | null> => {
  try {
    console.log("Fetching public tutor profile with ID:", tutorId);
    
    // Get base profile information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, city, role, bio")
      .eq("id", tutorId)
      .eq("role", "tutor")
      .single();
      
    if (profileError) {
      console.error("Error fetching tutor profile:", profileError);
      return null;
    }
    
    // Get tutor-specific information
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutor_profiles")
      .select("education_institution, degree, experience, methodology, is_published, education_verified")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (tutorError && tutorError.code !== 'PGRST116') {
      console.error("Error fetching tutor details:", tutorError);
    }
    
    // Get subject information 
    const { data: subjectsData } = await supabase
      .from("tutor_subjects")
      .select(`
        id, 
        subject_id,
        hourly_rate,
        subjects:subject_id (id, name)
      `)
      .eq("tutor_id", tutorId)
      .eq("is_active", true);
      
    // Construct simple subjects array
    const subjects = subjectsData?.map(item => {
      // Safely get the subject name
      const subjectObj = item.subjects as { id: string, name: string } | null;
      const subjectName = subjectObj ? subjectObj.name : '';
      
      return {
        id: item.id,
        name: subjectName,
        hourlyRate: item.hourly_rate || 0
      };
    }) || [];
    
    // Generate random rating for demo purposes (in a real app, this would come from reviews)
    const rating = 3.5 + Math.random() * 1.5;
    
    // Use non-null default values for tutorData properties
    const tutorInfo = tutorData || {
      experience: null,
      education_institution: null,
      degree: null,
      methodology: null,
      education_verified: false
    };
    
    // Add a random number to the avatar URL to avoid caching issues
    const avatarUrlWithParam = profileData.avatar_url 
      ? `${profileData.avatar_url}?${Math.random().toString(36).substring(7)}` 
      : null;
    
    const tutorProfile = {
      id: profileData.id,
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      avatar_url: avatarUrlWithParam,
      city: profileData.city || '',
      bio: profileData.bio || null,
      rating: rating,
      experience: tutorInfo.experience || null,
      education_institution: tutorInfo.education_institution || null,
      degree: tutorInfo.degree || null,
      methodology: tutorInfo.methodology || null,
      isVerified: tutorInfo.education_verified || false,
      subjects: subjects // This is correct now - an array of subject objects
    };
    
    console.log("Successfully fetched tutor profile:", tutorProfile);
    return tutorProfile;
  } catch (error) {
    console.error("Error in fetchPublicTutorById:", error);
    return null;
  }
};

/**
 * Fetches a list of tutors for the public listing
 */
export const fetchPublicTutors = async (
  page: number = 1, 
  pageSize: number = 5, 
  filters?: any
): Promise<{ tutors: PublicTutorProfile[], totalCount: number }> => {
  try {
    const offset = (page - 1) * pageSize;
    
    // Query to get only published tutor profiles
    let query = supabase
      .from("profiles")
      .select(`
        id, 
        first_name, 
        last_name, 
        avatar_url,
        city,
        bio,
        tutor_profiles!inner(is_published, experience, education_verified)
      `, { count: 'exact' })
      .eq("role", "tutor")
      .eq("tutor_profiles.is_published", true)
      .range(offset, offset + pageSize - 1);
    
    // Apply filters if provided
    if (filters) {
      // Apply subject filter if provided
      if (filters.subjectId) {
        // Find tutors who teach this subject
        const { data: tutorIds } = await supabase
          .from("tutor_subjects")
          .select("tutor_id")
          .eq("subject_id", filters.subjectId)
          .eq("is_active", true);
          
        if (tutorIds && tutorIds.length > 0) {
          const ids = tutorIds.map(item => item.tutor_id);
          query = query.in("id", ids);
        } else {
          // No tutors teach this subject
          return { tutors: [], totalCount: 0 };
        }
      }
      
      // Apply other filters here...
    }
    
    // Execute the query
    const { data: tutorProfiles, error, count } = await query;
    
    if (error) {
      console.error("Error fetching tutors:", error);
      return { tutors: [], totalCount: 0 };
    }
    
    if (!tutorProfiles || tutorProfiles.length === 0) {
      return { tutors: [], totalCount: 0 };
    }
    
    // Now enrich the tutor profiles with subject data
    const tutorIds = tutorProfiles.map(tutor => tutor.id);
    
    // Get subjects for all tutors in one query
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
      
      // Safely get the subject name
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
        education_institution: null, // These fields are filled on the profile page
        degree: null,
        methodology: null,
        subjects: tutorSubjectsMap[profile.id] || [] // This is correct now - an array of subject objects
      };
    });
    
    return { 
      tutors, 
      totalCount: count || tutors.length
    };
  } catch (error) {
    console.error("Error fetching public tutors:", error);
    return { tutors: [], totalCount: 0 };
  }
};
