
import { supabase } from "@/integrations/supabase/client";

/**
 * Create role-specific profile (student_profiles or tutor_profiles)
 */
export const createRoleSpecificProfile = async (userId: string, role: 'student' | 'tutor') => {
  try {
    console.log(`Creating ${role} profile for user:`, userId);
    
    // First, check if main profile exists, if not create it
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      throw profileCheckError;
    }

    // Create main profile if it doesn't exist
    if (!existingProfile) {
      console.log("Creating main profile for user:", userId);
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("Error creating main profile:", profileError);
        throw profileError;
      }
    } else if (existingProfile.role !== role) {
      // Update role if it's different
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role: role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (roleUpdateError) {
        console.error("Error updating role:", roleUpdateError);
        throw roleUpdateError;
      }
    }

    // Create role-specific profile
    if (role === 'student') {
      const { data: existingStudentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingStudentProfile) {
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
      }
    } else if (role === 'tutor') {
      const { data: existingTutorProfile } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingTutorProfile) {
        const { error: tutorError } = await supabase
          .from('tutor_profiles')
          .insert({
            id: userId,
            experience: 0,
            degree: null,
            education_institution: null,
            graduation_year: null,
            methodology: null,
            achievements: null,
            video_url: null,
            is_published: false,
            education_verified: false,
            updated_at: new Date().toISOString()
          });

        if (tutorError) {
          console.error("Error creating tutor profile:", tutorError);
          throw tutorError;
        }
      }
    }

    console.log(`${role} profile created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    throw error;
  }
};
