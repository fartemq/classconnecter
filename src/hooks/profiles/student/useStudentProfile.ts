
import { toast } from "@/hooks/use-toast";
import { Profile, ProfileUpdateParams } from "../types";
import { StudentProfileData } from "../types/profileTypes";
import { useBaseProfile } from "../useBaseProfile";
import { createRoleSpecificProfile } from "../utils";
import { fetchStudentProfileData } from "../utils/fetchProfile";
import { updateStudentProfileData } from "./updateStudentProfile";
import { UseStudentProfileResult } from "./types";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for managing student profile data with proper RLS compliance
 */
export const useStudentProfile = (): UseStudentProfileResult => {
  const { profile, setProfile, isLoading, error, user } = useBaseProfile("student");
  const { user: authUser } = useAuth();

  // Auto-create profile if it doesn't exist but user is authenticated
  useEffect(() => {
    const autoCreateProfile = async () => {
      if (authUser && !profile && !isLoading && !error) {
        console.log("Auto-creating student profile for user:", authUser.id);
        try {
          await createRoleSpecificProfile(authUser.id, 'student');
          
          // Refresh profile data without page reload
          const profileData = await fetchStudentProfileData(authUser.id);
          if (profileData) {
            setProfile(profileData);
          }
        } catch (error) {
          console.error("Error auto-creating student profile:", error);
          // Only show error if it's not related to RLS permissions
          if (!error?.message?.includes('row-level security')) {
            toast({
              title: "Информация",
              description: "Создаем ваш профиль ученика. Это займет несколько секунд...",
            });
          }
        }
      }
    };

    // Only try to create profile after auth is loaded and we're sure there's no profile
    if (!isLoading && authUser) {
      autoCreateProfile();
    }
  }, [authUser, profile, isLoading, error, setProfile]);

  // Update profile function with RLS compliance
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

      // Update student-specific profile - RLS will ensure proper access
      const studentUpdated = await updateStudentProfileData(profile.id, params);
      if (!studentUpdated) {
        throw new Error("Failed to update student profile");
      }

      console.log("Student profile specific data updated successfully");

      // Update local state with ALL fields from params
      setProfile(prev => {
        if (!prev) return prev;
        
        const studentProfiles = ('student_profiles' in prev ? prev.student_profiles : {}) as StudentProfileData;
        
        // Create a complete profile with all extended fields
        const updatedProfile: Profile = { 
          ...prev, 
          ...params,
          id: prev.id,
          role: prev.role,
          created_at: prev.created_at,
          updated_at: new Date().toISOString(),
          school: params.school || ('school' in prev ? prev.school : undefined),
          grade: params.grade || ('grade' in prev ? prev.grade : undefined),
          learning_goals: params.learning_goals || ('learning_goals' in prev ? prev.learning_goals : undefined),
          educational_level: params.educational_level || ('educational_level' in prev ? prev.educational_level : undefined),
          subjects: params.subjects || ('subjects' in prev ? prev.subjects : []),
          preferred_format: params.preferred_format || ('preferred_format' in prev ? prev.preferred_format : []),
          budget: params.budget || ('budget' in prev ? prev.budget : 1000),
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
        
        return updatedProfile;
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

  // Load student-specific data with proper error handling
  const loadStudentData = async (userId: string): Promise<Profile | null> => {
    try {
      console.log("Loading student data for user:", userId);
      const studentData = await fetchStudentProfileData(userId);
      
      if (studentData) {
        console.log("Student data loaded successfully:", studentData);
        return studentData;
      } else {
        console.log("No student profile found, creating one");
        await createRoleSpecificProfile(userId, 'student');
        return null;
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      return null;
    }
  };

  return {
    profile: profile as Profile | null,
    isLoading,
    updateProfile,
    loadStudentData,
    error
  };
};
