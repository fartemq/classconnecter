
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateParams } from "../types";

/**
 * Update the base profile in the profiles table
 */
export const updateBaseProfile = async (userId: string, params: ProfileUpdateParams): Promise<boolean> => {
  try {
    console.log("Updating base profile for user:", userId, "with params:", params);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: params.first_name,
        last_name: params.last_name,
        avatar_url: params.avatar_url,
        city: params.city,
        bio: params.bio,
        phone: params.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating base profile:", error);
      throw error;
    }

    console.log("Base profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateBaseProfile:", error);
    return false;
  }
};

/**
 * Update tutor-specific profile data
 */
export const updateTutorProfile = async (userId: string, params: ProfileUpdateParams): Promise<boolean> => {
  try {
    console.log("Updating tutor profile for user:", userId, "with params:", params);
    
    // First update base profile
    const baseUpdated = await updateBaseProfile(userId, params);
    if (!baseUpdated) {
      throw new Error("Failed to update base profile");
    }

    // Then update tutor-specific fields
    const tutorUpdateData: any = {};
    
    if (params.education_institution !== undefined) tutorUpdateData.education_institution = params.education_institution;
    if (params.degree !== undefined) tutorUpdateData.degree = params.degree;
    if (params.graduation_year !== undefined) tutorUpdateData.graduation_year = params.graduation_year;
    if (params.experience !== undefined) tutorUpdateData.experience = params.experience;
    if (params.methodology !== undefined) tutorUpdateData.methodology = params.methodology;
    if (params.achievements !== undefined) tutorUpdateData.achievements = params.achievements;
    if (params.video_url !== undefined) tutorUpdateData.video_url = params.video_url;
    
    // Only update if there are tutor-specific fields to update
    if (Object.keys(tutorUpdateData).length > 0) {
      tutorUpdateData.updated_at = new Date().toISOString();
      
      console.log("Updating tutor_profiles table with:", tutorUpdateData);
      
      const { error } = await supabase
        .from("tutor_profiles")
        .upsert({
          id: userId,
          ...tutorUpdateData
        });

      if (error) {
        console.error("Error updating tutor profile:", error);
        throw error;
      }
    }

    console.log("Tutor profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateTutorProfile:", error);
    return false;
  }
};

/**
 * Update student-specific profile data
 */
export const updateStudentProfile = async (userId: string, params: ProfileUpdateParams): Promise<boolean> => {
  try {
    console.log("Updating student profile for user:", userId, "with params:", params);
    
    // First update base profile
    const baseUpdated = await updateBaseProfile(userId, params);
    if (!baseUpdated) {
      throw new Error("Failed to update base profile");
    }

    // Then update student-specific fields if any exist
    const studentUpdateData: any = {};
    
    if (params.school !== undefined) studentUpdateData.school = params.school;
    if (params.educational_level !== undefined) studentUpdateData.educational_level = params.educational_level;
    if (params.grade !== undefined) studentUpdateData.grade = params.grade;
    if (params.subjects !== undefined) studentUpdateData.subjects = params.subjects;
    if (params.preferred_format !== undefined) studentUpdateData.preferred_format = params.preferred_format;
    if (params.learning_goals !== undefined) studentUpdateData.learning_goals = params.learning_goals;
    if (params.budget !== undefined) studentUpdateData.budget = params.budget;
    
    // Only update if there are student-specific fields to update
    if (Object.keys(studentUpdateData).length > 0) {
      console.log("Updating student_profiles table with:", studentUpdateData);
      
      const { error } = await supabase
        .from("student_profiles")
        .upsert({
          id: userId,
          ...studentUpdateData
        });

      if (error) {
        console.error("Error updating student profile:", error);
        throw error;
      }
    }

    console.log("Student profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error in updateStudentProfile:", error);
    return false;
  }
};
