
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams, Profile } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./utils";
import { fetchStudentProfileData, updateBaseProfile, updateStudentProfile } from "./utils";

export const useStudentProfile = () => {
  const { profile, setProfile, isLoading, error } = useBaseProfile("student");

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

      // Step 1: Update the main profile data
      const baseUpdated = await updateBaseProfile(profile.id, params);
      if (!baseUpdated) {
        throw new Error("Failed to update base profile");
      }
      
      console.log("Main profile updated successfully");

      // Step 2: Update student-specific profile
      const studentUpdated = await updateStudentProfile(profile.id, params);
      if (!studentUpdated) {
        throw new Error("Failed to update student profile");
      }

      console.log("Student profile specific data updated successfully");

      // Update local state
      setProfile(prev => {
        if (!prev) return params as Profile;
        return { ...prev, ...params };
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
