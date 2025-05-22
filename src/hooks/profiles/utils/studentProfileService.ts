
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateParams } from "../types";

/**
 * Updates a student profile with the given data
 */
export async function updateStudentProfile(
  userId: string,
  profileData: ProfileUpdateParams
): Promise<boolean> {
  try {
    console.log("Updating student profile for user", userId, "with data:", profileData);
    
    // First check if the student profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking if student profile exists:", checkError);
      return false;
    }

    // Prepare student data with all educational fields
    const studentData = {
      educational_level: profileData.educational_level || null,
      subjects: profileData.subjects || [],
      learning_goals: profileData.learning_goals || null,
      preferred_format: profileData.preferred_format || [],
      school: profileData.school || null,
      grade: profileData.grade || null,
      budget: profileData.budget || 1000
    };

    // Also update the base profile data
    const baseProfileData = {
      first_name: profileData.first_name || null,
      last_name: profileData.last_name || null,
      bio: profileData.bio || null,
      city: profileData.city || null,
      phone: profileData.phone || null,
      avatar_url: profileData.avatar_url || null,
      updated_at: new Date().toISOString()
    };
    
    console.log("Student profile data to save:", studentData);
    console.log("Base profile data to save:", baseProfileData);
    console.log("School value being saved:", profileData.school);
    console.log("Grade value being saved:", profileData.grade);
    console.log("Learning goals being saved:", profileData.learning_goals);
    console.log("Educational level being saved:", profileData.educational_level);
    
    // Update the base profile first
    const { error: baseProfileError } = await supabase
      .from("profiles")
      .update(baseProfileData)
      .eq("id", userId);

    if (baseProfileError) {
      console.error("Error updating base profile:", baseProfileError);
      return false;
    }
    
    // Then update the student-specific profile
    if (existingProfile) {
      console.log("Updating existing student profile for user:", userId);
      // Update existing record
      const { error } = await supabase
        .from("student_profiles")
        .update(studentData)
        .eq("id", userId);
        
      if (error) {
        console.error("Error updating student profile:", error);
        return false;
      }
    } else {
      console.log("Creating new student profile for user:", userId);
      // Create new record
      const { error } = await supabase
        .from("student_profiles")
        .insert({ ...studentData, id: userId });
        
      if (error) {
        console.error("Error creating student profile:", error);
        return false;
      }
    }
    
    console.log("Student profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateStudentProfile:", error);
    return false;
  }
}
