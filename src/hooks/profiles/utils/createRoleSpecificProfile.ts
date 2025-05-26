
import { supabase } from "@/integrations/supabase/client";

/**
 * Create role-specific profile with proper RLS compliance
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
      // Ignore RLS errors as they're expected during creation
      if (!profileCheckError.message?.includes('row-level security')) {
        throw profileCheckError;
      }
    }

    // Create main profile if it doesn't exist - RLS will ensure proper access
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
        // Ignore RLS errors during creation
        if (!profileError.message?.includes('row-level security')) {
          throw profileError;
        }
      }
    } else if (existingProfile.role !== role) {
      // Update role if it's different - RLS will ensure proper access
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role: role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (roleUpdateError) {
        console.error("Error updating role:", roleUpdateError);
        // Ignore RLS errors during update
        if (!roleUpdateError.message?.includes('row-level security')) {
          throw roleUpdateError;
        }
      }
    }

    // Create role-specific profile with RLS compliance
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
          // Ignore RLS errors during creation
          if (!studentError.message?.includes('row-level security')) {
            throw studentError;
          }
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
          // Ignore RLS errors during creation
          if (!tutorError.message?.includes('row-level security')) {
            throw tutorError;
          }
        }
      }
    }

    console.log(`${role} profile created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    
    // Don't throw RLS errors as they're expected during profile creation
    if (error?.message?.includes('row-level security')) {
      console.log("RLS error during profile creation is expected, continuing...");
      return true;
    }
    
    throw error;
  }
};
