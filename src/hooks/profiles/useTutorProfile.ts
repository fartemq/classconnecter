
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./utils";
import { fetchTutorProfileData } from "./utils/fetchProfile";
import { updateTutorProfile } from "./utils/updateProfile";

/**
 * Hook for managing tutor profile data
 */
export const useTutorProfile = () => {
  const { profile, setProfile, isLoading, error, user } = useBaseProfile("tutor");

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

      // Update tutor-specific profile
      const tutorUpdated = await updateTutorProfile(profile.id, params);
      if (!tutorUpdated) {
        throw new Error("Failed to update tutor profile");
      }

      console.log("Tutor profile specific data updated successfully");

      // Update local state with ALL fields from params
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
          // Explicitly update education fields to ensure they're properly stored in state
          education_institution: params.education_institution || prev.education_institution,
          degree: params.degree || prev.degree,
          graduation_year: params.graduation_year || prev.graduation_year,
          experience: params.experience || prev.experience,
          methodology: params.methodology || prev.methodology,
          achievements: params.achievements || prev.achievements,
          video_url: params.video_url || prev.video_url
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
