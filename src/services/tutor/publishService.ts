
import { supabase } from "@/integrations/supabase/client";
import { validateTutorProfile } from "./validationService";

/**
 * Update the published status of a tutor profile
 */
export const publishTutorProfile = async (tutorId: string, publishStatus: boolean): Promise<boolean> => {
  try {
    // If trying to publish, check if the profile is valid
    if (publishStatus) {
      const validation = await validateTutorProfile(tutorId);
      if (!validation.isValid) {
        console.error("Cannot publish invalid profile:", validation.missingFields);
        return false;
      }
    }
    
    // Update the publish status
    const { error } = await supabase
      .from("tutor_profiles")
      .update({ is_published: publishStatus })
      .eq("id", tutorId);
    
    if (error) {
      console.error("Error publishing tutor profile:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in publishTutorProfile:", error);
    return false;
  }
};
