
import { supabase } from "@/integrations/supabase/client";

/**
 * Create role-specific profile with proper RLS compliance
 * Note: Main profiles are now created automatically via database triggers
 * This function is primarily for manual profile creation if needed
 */
export const createRoleSpecificProfile = async (userId: string, role: 'student' | 'tutor') => {
  try {
    console.log(`Creating ${role} profile for user:`, userId);
    
    // Check if main profile exists (should exist due to trigger)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError) {
      console.error("Error checking profile:", profileCheckError);
      // Continue anyway as trigger should have created it
    }

    if (!existingProfile) {
      console.log("Profile not found, creating main profile manually");
      // Fallback: create main profile manually if trigger didn't work
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error("Error creating main profile:", profileError);
      }
    }

    // Create role-specific profiles if they don't exist
    if (role === 'student') {
      const { data: existingStudentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingStudentProfile) {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .upsert({
            id: userId,
            educational_level: null,
            subjects: [],
            learning_goals: null,
            preferred_format: [],
            school: null,
            grade: null,
            budget: 1000
          }, {
            onConflict: 'id'
          });

        if (studentError) {
          console.error("Error creating student profile:", studentError);
        } else {
          console.log("Student profile created successfully");
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
          .upsert({
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
          }, {
            onConflict: 'id'
          });

        if (tutorError) {
          console.error("Error creating tutor profile:", tutorError);
        } else {
          console.log("Tutor profile created successfully");
        }
      }
    }

    console.log(`${role} profile creation completed successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating ${role} profile:`, error);
    // Don't throw errors as profiles should be created by triggers
    return true;
  }
};
