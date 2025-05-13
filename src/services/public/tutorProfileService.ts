
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
      .select("id, first_name, last_name, avatar_url, city, role")
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
      const subjectName = item.subjects?.name || '';
      
      return {
        id: item.id,
        name: subjectName,
        hourlyRate: item.hourly_rate || 0
      };
    }) || [];
    
    // Generate random rating for demo purposes (in a real app, this would come from reviews)
    const rating = 3.5 + Math.random() * 1.5;
    
    const tutorProfile = {
      id: profileData.id,
      first_name: profileData.first_name || '',
      last_name: profileData.last_name || '',
      avatar_url: profileData.avatar_url,
      city: profileData.city || '',
      bio: profileData.bio || null,
      rating: rating,
      experience: tutorData?.experience || null,
      education_institution: tutorData?.education_institution || null,
      degree: tutorData?.degree || null,
      methodology: tutorData?.methodology || null,
      isVerified: tutorData?.education_verified || false,
      subjects: subjects
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
      
      tutorSubjectsMap[tutorId].push({
        id: subjectEntry.subject_id,
        name: subjectEntry.subjects?.name || '',
        hourlyRate: subjectEntry.hourly_rate || 0
      });
    });
    
    // Generate tutors with all required data
    const tutors = tutorProfiles.map(profile => {
      // Generate random rating for demo purposes
      const rating = 3.5 + Math.random() * 1.5;
      
      return {
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url,
        city: profile.city || '',
        bio: profile.bio || null,
        rating: rating,
        experience: profile.tutor_profiles?.experience || null,
        isVerified: profile.tutor_profiles?.education_verified || false,
        education_institution: null,
        degree: null,
        methodology: null,
        subjects: tutorSubjectsMap[profile.id] || []
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
