
import { supabase } from "@/integrations/supabase/client";
import { validateTutorProfile } from "./validationService";

/**
 * Update the published status of a tutor profile
 */
export const publishTutorProfile = async (tutorId: string, publishStatus: boolean): Promise<boolean> => {
  try {
    console.log(`Attempting to ${publishStatus ? 'publish' : 'unpublish'} tutor profile for ID:`, tutorId);
    
    // If trying to publish, check if the profile is valid
    if (publishStatus) {
      const validation = await validateTutorProfile(tutorId);
      if (!validation.isValid) {
        console.error("Cannot publish invalid profile. Missing fields:", validation.missingFields);
        throw new Error(`Профиль не готов к публикации. Заполните: ${validation.missingFields.join(', ')}`);
      }
    }
    
    // Update the publish status
    const { error } = await supabase
      .from("tutor_profiles")
      .update({ 
        is_published: publishStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", tutorId);
    
    if (error) {
      console.error("Error updating tutor profile publish status:", error);
      throw new Error("Не удалось обновить статус публикации");
    }
    
    console.log(`Tutor profile successfully ${publishStatus ? 'published' : 'unpublished'}`);
    return true;
  } catch (error) {
    console.error("Exception in publishTutorProfile:", error);
    throw error;
  }
};
