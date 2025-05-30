
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

      // Update basic profile first
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: params.first_name,
          last_name: params.last_name,
          bio: params.bio,
          city: params.city,
          avatar_url: params.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) {
        console.error("Error updating basic profile:", profileError);
        throw new Error("Failed to update basic profile");
      }

      // Check if tutor_profiles record exists
      const { data: existingTutorProfile, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking tutor profile:", checkError);
        throw new Error("Failed to check tutor profile");
      }

      // Prepare tutor-specific data
      const tutorData = {
        education_institution: params.education_institution || null,
        degree: params.degree || null,
        graduation_year: params.graduation_year || new Date().getFullYear(),
        methodology: params.methodology || null,
        experience: params.experience || 0,
        achievements: params.achievements || null,
        video_url: params.video_url || null,
        updated_at: new Date().toISOString(),
      };

      if (existingTutorProfile) {
        // Update existing tutor profile
        const { error: tutorUpdateError } = await supabase
          .from("tutor_profiles")
          .update(tutorData)
          .eq("id", profile.id);

        if (tutorUpdateError) {
          console.error("Error updating tutor profile:", tutorUpdateError);
          throw new Error("Failed to update tutor profile");
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
          console.error("Error creating tutor profile:", tutorCreateError);
          throw new Error("Failed to create tutor profile");
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

      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
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
        console.log("No tutor profile found, creating one");
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
