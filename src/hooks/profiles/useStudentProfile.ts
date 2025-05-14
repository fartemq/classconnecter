
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams, Profile } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile, updateStudentProfile } from "./profileUtils";

export const useStudentProfile = () => {
  const { profile, setProfile, isLoading, error } = useBaseProfile("student");

  // Load student-specific profile data
  const loadStudentData = async (userId: string) => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
        
      if (studentError && studentError.code !== 'PGRST116') {
        console.error("Error fetching student profile:", studentError);
        return null;
      } else if (studentData) {
        return {
          educational_level: studentData.educational_level,
          subjects: studentData.subjects,
          learning_goals: studentData.learning_goals,
          preferred_format: studentData.preferred_format,
          school: studentData.school,
          grade: studentData.grade,
          budget: studentData.budget
        };
      } else {
        // Create student profile if it doesn't exist
        await createRoleSpecificProfile(userId, 'student');
        return null;
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      return null;
    }
  };

  // Update profile function
  const updateProfile = async (params: ProfileUpdateParams): Promise<boolean> => {
    try {
      if (!profile?.id) {
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating student profile with data:", params);

      // Update the main profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: params.first_name,
          last_name: params.last_name,
          bio: params.bio,
          city: params.city,
          phone: params.phone,
          avatar_url: params.avatar_url,
        })
        .eq("id", profile.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Update student-specific profile
      const success = await updateStudentProfile(profile.id, params);
      if (!success) {
        throw new Error("Failed to update student profile");
      }

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

  return {
    profile,
    isLoading,
    updateProfile,
    error
  };
};
