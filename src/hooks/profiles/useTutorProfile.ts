
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileUpdateParams } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./utils";
import { fetchTutorProfileData } from "./utils/fetchProfile";
import { logger } from "@/utils/logger";

/**
 * Hook for managing tutor profile data
 */
export const useTutorProfile = () => {
  const { profile, setProfile, isLoading, error, user } = useBaseProfile("tutor");

  // Update profile function for tutors
  const updateProfile = async (params: ProfileUpdateParams): Promise<boolean> => {
    try {
      if (!profile?.id) {
        logger.error("No profile ID found", "tutor-profile");
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      logger.debug("Updating tutor profile", "tutor-profile", params);

      // Start transaction-like approach
      const profileData = {
        first_name: params.first_name,
        last_name: params.last_name,
        bio: params.bio,
        city: params.city,
        avatar_url: params.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const tutorData = {
        education_institution: params.education_institution || '',
        degree: params.degree || '',
        graduation_year: params.graduation_year || new Date().getFullYear(),
        methodology: params.methodology || '',
        experience: params.experience || 0,
        achievements: params.achievements || '',
        video_url: params.video_url || '',
        updated_at: new Date().toISOString(),
      };

      // Update basic profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", profile.id);

      if (profileError) {
        logger.error("Error updating basic profile", "tutor-profile", profileError);
        throw profileError;
      }

      // Check if tutor_profiles record exists
      const { data: existingTutorProfile, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        logger.error("Error checking tutor profile", "tutor-profile", checkError);
        throw checkError;
      }

      if (existingTutorProfile) {
        // Update existing tutor profile
        const { error: tutorUpdateError } = await supabase
          .from("tutor_profiles")
          .update(tutorData)
          .eq("id", profile.id);

        if (tutorUpdateError) {
          logger.error("Error updating tutor profile", "tutor-profile", tutorUpdateError);
          throw tutorUpdateError;
        }
      } else {
        // Create new tutor profile
        const { error: tutorCreateError } = await supabase
          .from("tutor_profiles")
          .insert({
            id: profile.id,
            ...tutorData,
            is_published: false,
            education_verified: false,
          });

        if (tutorCreateError) {
          logger.error("Error creating tutor profile", "tutor-profile", tutorCreateError);
          throw tutorCreateError;
        }
      }

      // Update local state
      setProfile(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          ...params,
          updated_at: new Date().toISOString(),
        };
      });

      toast({
        title: "Успешно",
        description: "Профиль успешно обновлен",
      });

      logger.info("Profile update completed successfully", "tutor-profile");
      return true;
    } catch (error) {
      logger.error("Error in updateProfile", "tutor-profile", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить профиль",
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
        logger.debug("No tutor profile found, creating one", "tutor-profile");
        await createRoleSpecificProfile(userId, 'tutor');
        return null;
      }
    } catch (error) {
      logger.error("Error loading tutor data", "tutor-profile", error);
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
