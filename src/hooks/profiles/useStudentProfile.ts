
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./utils";
import { fetchStudentProfileData } from "./utils/fetchProfile";
import { updateStudentProfile } from "./utils/updateProfile";

/**
 * Hook for managing student profile data
 */
export const useStudentProfile = () => {
  const { profile, setProfile, isLoading, error, user } = useBaseProfile("student");

  // Update profile function for students
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

      // Update student-specific profile
      const studentUpdated = await updateStudentProfile(profile.id, params);
      if (!studentUpdated) {
        throw new Error("Failed to update student profile");
      }

      console.log("Student profile updated successfully");

      // Update local state
      setProfile(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          ...params,
          // Explicitly maintain required Profile fields
          id: prev.id,
          role: prev.role,
          created_at: prev.created_at,
          updated_at: prev.updated_at,
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
        title: "Ошибка",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Load student-specific data
  const loadStudentData = async (userId: string) => {
    try {
      const studentData = await fetchStudentProfileData(userId);
      
      if (studentData) {
        return {
          school: studentData.school,
          educational_level: studentData.educational_level,
          grade: studentData.grade,
          subjects: studentData.subjects,
          preferred_format: studentData.preferred_format,
          learning_goals: studentData.learning_goals,
          budget: studentData.budget
        };
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
