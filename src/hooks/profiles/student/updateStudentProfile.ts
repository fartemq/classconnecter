
import { ProfileUpdateParams } from "../types";
import { updateStudentProfile } from "../utils/updateProfile";

/**
 * Updates a student profile with the given data
 */
export async function updateStudentProfileData(
  userId: string,
  profileData: ProfileUpdateParams
): Promise<boolean> {
  console.log("Calling updateStudentProfileData with:", userId, profileData);
  
  // Extract key education fields for logging
  const { school, grade, learning_goals, educational_level } = profileData;
  console.log("Education data being passed to update:", {
    school,
    grade,
    learning_goals,
    educational_level
  });
  
  return updateStudentProfile(userId, profileData);
}
