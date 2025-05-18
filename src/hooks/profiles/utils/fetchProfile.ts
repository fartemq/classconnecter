
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "../types";

/**
 * Fetches a user profile from the database
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    console.log("Fetching profile for user:", userId);
    
    // Fetch the profile data
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    console.log("Basic profile data loaded:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchProfile:", error);
    return null;
  }
}

/**
 * Fetches additional data for a student profile
 */
export async function fetchStudentProfileData(userId: string) {
  try {
    console.log("Fetching additional student data for user:", userId);
    
    // Fetch student-specific profile data
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching student profile:", error);
      return null;
    }
    
    console.log("Student specific data loaded:", data);
    
    return data ? {
      educational_level: data.educational_level,
      subjects: data.subjects || [],
      learning_goals: data.learning_goals,
      preferred_format: data.preferred_format || [],
      school: data.school,
      grade: data.grade,
      budget: data.budget
    } : null;
  } catch (error) {
    console.error("Error in fetchStudentProfileData:", error);
    return null;
  }
}

/**
 * Fetches additional data for a tutor profile
 */
export async function fetchTutorProfileData(userId: string) {
  try {
    console.log("Fetching additional tutor data for user:", userId);
    
    // Fetch tutor-specific profile data
    const { data, error } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching tutor profile:", error);
      return null;
    }
    
    console.log("Tutor specific data loaded:", data);
    
    return data ? {
      education_institution: data.education_institution,
      degree: data.degree,
      graduation_year: data.graduation_year,
      experience: data.experience,
      methodology: data.methodology,
      achievements: data.achievements,
      video_url: data.video_url,
      is_published: data.is_published,
      education_verified: data.education_verified
    } : null;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
}
