
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateParams } from "../types";

/**
 * Updates the base profile information
 * Note: This function is kept for backward compatibility,
 * But the preferred approach is to use updateStudentProfile or updateTutorProfile
 */
export async function updateBaseProfile(
  userId: string,
  profileData: ProfileUpdateParams
): Promise<boolean> {
  try {
    console.log("Updating base profile for user", userId, "with data:", profileData);
    
    const baseProfileData = {
      first_name: profileData.first_name || null,
      last_name: profileData.last_name || null,
      bio: profileData.bio || null,
      city: profileData.city || null,
      phone: profileData.phone || null,
      avatar_url: profileData.avatar_url || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("profiles")
      .update(baseProfileData)
      .eq("id", userId);

    if (error) {
      console.error("Error updating base profile:", error);
      return false;
    }

    console.log("Base profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateBaseProfile:", error);
    return false;
  }
}
