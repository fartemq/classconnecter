
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Profile, ProfileUpdateParams } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile, fetchTutorProfileData } from "./profileUtils";

export const useTutorProfile = () => {
  const { profile, setProfile, isLoading, error } = useBaseProfile("tutor");

  // Function to update profile data
  const updateProfile = async (updatedProfile: ProfileUpdateParams): Promise<boolean> => {
    try {
      if (!profile?.id) {
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating tutor profile with data:", updatedProfile);

      // Update the main profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          bio: updatedProfile.bio,
          city: updatedProfile.city,
          phone: updatedProfile.phone,
          avatar_url: updatedProfile.avatar_url,
        })
        .eq("id", profile.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
      
      // Update tutor-specific profile data
      const { error: tutorError } = await supabase
        .from("tutor_profiles")
        .update({
          education_institution: updatedProfile.education_institution,
          degree: updatedProfile.degree,
          graduation_year: updatedProfile.graduation_year,
          experience: updatedProfile.experience,
          methodology: updatedProfile.methodology,
          achievements: updatedProfile.achievements,
          video_url: updatedProfile.video_url
        })
        .eq("id", profile.id);

      if (tutorError) {
        console.error("Error updating tutor profile:", tutorError);
        throw tutorError;
      }

      // Update local state
      setProfile(prev => {
        if (!prev) return updatedProfile as Profile;
        return { ...prev, ...updatedProfile };
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

  // Load tutor-specific data after base profile is loaded
  const loadTutorData = async (userId: string) => {
    try {
      const tutorData = await fetchTutorProfileData(userId);
      
      // Create tutor profile if needed
      if (!tutorData) {
        await createRoleSpecificProfile(userId, 'tutor');
        return null;
      }
      
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
    } catch (error) {
      console.error("Error loading tutor data:", error);
      return null;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    error
  };
};
