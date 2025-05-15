
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileUpdateParams, Profile } from "./types";
import { useBaseProfile } from "./useBaseProfile";
import { createRoleSpecificProfile } from "./profileUtils";

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
        console.error("No profile ID found");
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating student profile with data:", params);

      // Step 1: Update the main profile data with proper error handling
      const { data: profileUpdateData, error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: params.first_name,
          last_name: params.last_name,
          bio: params.bio,
          city: params.city,
          phone: params.phone,
          avatar_url: params.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id)
        .select();

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Main profile updated successfully:", profileUpdateData);

      // Step 2: Update student-specific profile with proper error handling
      const studentProfileData = {
        educational_level: params.educational_level || 'school',
        subjects: params.subjects || [],
        learning_goals: params.learning_goals || '',
        preferred_format: params.preferred_format || [],
        school: params.school || '',
        grade: params.grade || '',
        budget: params.budget || null
      };

      // Check if student profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking student profile existence:", checkError);
        throw checkError;
      }
        
      let studentUpdateResult;
      
      if (existingProfile) {
        // Update existing record
        studentUpdateResult = await supabase
          .from("student_profiles")
          .update(studentProfileData)
          .eq("id", profile.id)
          .select();
      } else {
        // Create new record
        studentUpdateResult = await supabase
          .from("student_profiles")
          .insert({ ...studentProfileData, id: profile.id })
          .select();
      }
      
      if (studentUpdateResult.error) {
        console.error("Error updating student profile:", studentUpdateResult.error);
        throw studentUpdateResult.error;
      }

      console.log("Student profile specific data updated successfully:", studentUpdateResult.data);

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
