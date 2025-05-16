
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches tutor-specific profile data
 */
export async function fetchTutorProfileData(userId: string) {
  try {
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (tutorProfileError) {
      console.error("Error fetching tutor profile data:", tutorProfileError);
      return null;
    }
    
    return tutorProfileData;
  } catch (error) {
    console.error("Error in fetchTutorProfileData:", error);
    return null;
  }
}

/**
 * Fetch student-specific profile data
 */
export async function fetchStudentProfileData(userId: string) {
  try {
    console.log("Loading student profile data for user:", userId);
    
    const { data: studentData, error: studentError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
      
    if (studentError && studentError.code !== 'PGRST116') {
      console.error("Error fetching student profile:", studentError);
      return null;
    } else if (studentData) {
      console.log("Found student profile data:", studentData);
      return {
        educational_level: studentData.educational_level,
        subjects: studentData.subjects,
        learning_goals: studentData.learning_goals,
        preferred_format: studentData.preferred_format,
        school: studentData.school,
        grade: studentData.grade,
        budget: studentData.budget
      };
    } else {
      console.log("No student profile found");
      return null;
    }
  } catch (error) {
    console.error("Error loading student data:", error);
    return null;
  }
}
