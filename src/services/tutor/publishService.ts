
import { supabase } from "@/integrations/supabase/client";

/**
 * Publish or unpublish a tutor's profile
 */
export const publishTutorProfile = async (tutorId: string, isPublished: boolean): Promise<boolean> => {
  try {
    console.log("Publishing tutor profile for:", tutorId, "Status:", isPublished);
    
    // Check if tutor_profiles exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("id", tutorId)
      .maybeSingle();
      
    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: tutorId,
          is_published: isPublished,
          education_verified: false,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error creating tutor profile for publishing:", insertError);
        return false;
      }
    } else {
      // Update existing profile
      const { error } = await supabase
        .from("tutor_profiles")
        .update({
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq("id", tutorId);
        
      if (error) {
        console.error("Error publishing tutor profile:", error);
        return false;
      }
    }
    
    console.log("Profile publish status updated successfully");
    return true;
  } catch (error) {
    console.error("Error publishing tutor profile:", error);
    return false;
  }
};

/**
 * Get the publication status of a tutor's profile
 */
export const getTutorPublicationStatus = async (tutorId: string): Promise<{
  isPublished: boolean;
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> => {
  try {
    // Import here to avoid circular dependency
    const { validateTutorProfile } = await import('./validationService');
    
    const { data } = await supabase
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .maybeSingle();
      
    const validationResult = await validateTutorProfile(tutorId);
    
    return {
      isPublished: !!data?.is_published,
      isValid: validationResult.isValid,
      missingFields: validationResult.missingFields,
      warnings: validationResult.warnings
    };
  } catch (error) {
    console.error("Error getting publication status:", error);
    return {
      isPublished: false,
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: []
    };
  }
};
