
import { ProfileUpdateParams, Profile } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { updateBaseProfile, updateTutorProfile, fetchTutorProfileData } from "./utils";
import { toast } from "@/hooks/use-toast";
import { createRoleSpecificProfile } from "./utils";

export const useTutorProfile = () => {
  const { profile, setProfile, isLoading, error } = useBaseProfile("tutor");

  // Update profile function for tutors
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

      console.log("Updating tutor profile with data:", params);

      // Step 1: Update the main profile data
      const baseUpdated = await updateBaseProfile(profile.id, params);
      if (!baseUpdated) {
        throw new Error("Failed to update base profile");
      }
      
      console.log("Main profile updated successfully");

      // Step 2: Update tutor-specific profile
      const tutorUpdated = await updateTutorProfile(profile.id, params);
      if (!tutorUpdated) {
        throw new Error("Failed to update tutor profile");
      }

      console.log("Tutor profile specific data updated successfully");

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
  
  // Load tutor-specific data
  const loadTutorData = async (userId: string) => {
    try {
      const tutorData = await fetchTutorProfileData(userId);
      
      if (tutorData) {
        return {
          education_institution: tutorData.education_institution,
          degree: tutorData.degree,
          graduation_year: tutorData.graduation_year,
          experience: tutorData.experience,
          methodology: tutorData.methodology,
          achievements: tutorData.achievements,
          video_url: tutorData.video_url,
          is_published: tutorData.is_published,
          education_verified: tutorData.education_verified
        };
      } else {
        console.log("No tutor profile found, creating one");
        // Create tutor profile if it doesn't exist
        await createRoleSpecificProfile(userId, 'tutor');
        return null;
      }
    } catch (error) {
      console.error("Error loading tutor data:", error);
      return null;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    loadTutorData,
    error
  };
};
