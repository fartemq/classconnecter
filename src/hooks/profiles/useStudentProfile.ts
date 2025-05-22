
import { toast } from "@/hooks/use-toast";
import { Profile, ProfileUpdateParams } from "./types";
import { StudentProfileData } from "./types/profileTypes";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./utils";
import { fetchStudentProfileData } from "./utils/fetchProfile";
import { updateStudentProfile } from "./utils/updateProfile";

/**
 * Hook for managing student profile data
 */
export const useStudentProfile = () => {
  const { profile, setProfile, isLoading, error, user } = useBaseProfile("student");

  // Update profile function
  const updateProfile = async (params: ProfileUpdateParams): Promise<boolean> => {
    try {
      if (!profile?.id) {
        console.error("No profile ID found");
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating student profile with data:", params);
      console.log("School value:", params.school);
      console.log("Grade value:", params.grade);
      console.log("Learning goals:", params.learning_goals);
      console.log("Educational level:", params.educational_level);

      // Update student-specific profile
      const studentUpdated = await updateStudentProfile(profile.id, params);
      if (!studentUpdated) {
        throw new Error("Failed to update student profile");
      }

      console.log("Student profile specific data updated successfully");

      // Update local state with ALL fields from params
      setProfile(prev => {
        if (!prev) return prev;
        
        // Ensure student_profiles exists in the profile object
        const studentProfiles = prev.student_profiles || {} as StudentProfileData;
        
        return { 
          ...prev, 
          ...params,
          // Explicitly maintain required Profile fields
          id: prev.id,
          role: prev.role,
          created_at: prev.created_at,
          updated_at: prev.updated_at,
          // Explicitly update student profile fields to ensure they're properly stored in state
          school: params.school || prev.school,
          grade: params.grade || prev.grade,
          learning_goals: params.learning_goals || prev.learning_goals,
          educational_level: params.educational_level || prev.educational_level,
          subjects: params.subjects || prev.subjects || [],
          preferred_format: params.preferred_format || prev.preferred_format || [],
          budget: params.budget || prev.budget || 1000,
          // Make sure these fields are properly assigned to the student_profiles object
          student_profiles: {
            ...studentProfiles,
            educational_level: params.educational_level || studentProfiles.educational_level || null,
            subjects: params.subjects || studentProfiles.subjects || [],
            learning_goals: params.learning_goals || studentProfiles.learning_goals || null,
            preferred_format: params.preferred_format || studentProfiles.preferred_format || [],
            school: params.school || studentProfiles.school || null,
            grade: params.grade || studentProfiles.grade || null,
            budget: params.budget || studentProfiles.budget || 1000
          }
        };
      });

      toast({
        title: "Успешно",
        description: "Профиль успешно обновлен",
      });

      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
      });
      return false;
    }
  };

  // Load student-specific data
  const loadStudentData = async (userId: string) => {
    try {
      console.log("Loading student data for user:", userId);
      const studentData = await fetchStudentProfileData(userId);
      
      if (studentData) {
        console.log("Student data loaded successfully:", studentData);
        return studentData;
      } else {
        console.log("No student profile found, creating one");
        // Create student profile if it doesn't exist
        await createRoleSpecificProfile(userId, 'student');
        return null;
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      return null;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    loadStudentData,
    error
  };
};
