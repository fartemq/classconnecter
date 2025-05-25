
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates role-specific profile data for a user
 */
export const createRoleSpecificProfile = async (userId: string, role: 'student' | 'tutor') => {
  try {
    console.log(`Creating ${role} profile for user:`, userId);
    
    if (role === 'student') {
      // Create student profile with default values
      const { error: studentError } = await supabase
        .from('student_profiles')
        .insert({
          id: userId,
          educational_level: null,
          subjects: [],
          learning_goals: null,
          preferred_format: [],
          school: null,
          grade: null,
          budget: 1000
        });
      
      if (studentError) {
        console.error("Error creating student profile:", studentError);
        throw studentError;
      }
      
      console.log("Student profile created successfully");
    } else if (role === 'tutor') {
      // Create tutor profile with default values
      const { error: tutorError } = await supabase
        .from('tutor_profiles')
        .insert({
          id: userId,
          hourly_rate: 1000,
          experience: 0,
          education_institution: null,
          degree: null,
          graduation_year: null,
          methodology: null,
          achievements: null,
          video_url: null,
          is_published: false
        });
      
      if (tutorError) {
        console.error("Error creating tutor profile:", tutorError);
        throw tutorError;
      }
      
      console.log("Tutor profile created successfully");
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    throw error;
  }
};
