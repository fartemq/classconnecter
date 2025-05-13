
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Profile, ProfileUpdateParams } from "./types";
import { 
  createBasicProfile, 
  createRoleSpecificProfile, 
  fetchTutorProfileData,
  updateStudentProfile,
  checkRoleMatch 
} from "./profileUtils";

export const useProfile = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Function to update profile data
  const updateProfile = async (updatedProfile: Partial<Profile>): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "Ошибка",
          description: "Пользователь не авторизован",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating profile with data:", updatedProfile);

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
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // If this is a student, update student-specific profile data
      if (requiredRole === 'student' || userRole === 'student') {
        const success = await updateStudentProfile(user.id, updatedProfile);
        if (!success) {
          throw new Error("Failed to update student profile");
        }
      }
      
      // If this is a tutor, update tutor-specific profile data
      else if (requiredRole === 'tutor' || userRole === 'tutor') {
        const { error: tutorError } = await supabase
          .from("tutor_profiles")
          .update({
            education_institution: updatedProfile.education_institution,
            degree: updatedProfile.degree,
            graduation_year: updatedProfile.graduation_year,
            experience: updatedProfile.experience,
            methodology: updatedProfile.methodology
          })
          .eq("id", user.id);

        if (tutorError) {
          console.error("Error updating tutor profile:", tutorError);
          throw tutorError;
        }
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

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        if (isMounted) setIsLoading(true);
        
        // Check if user is authenticated
        if (!user) {
          console.log("No active session found, redirecting to login");
          if (isMounted) {
            toast({
              title: "Требуется авторизация",
              description: "Пожалуйста, войдите в систему для продолжения.",
              variant: "destructive",
            });
            navigate("/login");
          }
          return;
        }
        
        // Get user profile
        console.log("Fetching profile for user:", user.id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        // If profile doesn't exist yet, create a basic one
        if (!profileData && !profileError) {
          const defaultRole = requiredRole || "student";
          const newProfile = await createBasicProfile(user, defaultRole);
            
          if (newProfile) {
            await createRoleSpecificProfile(user.id, defaultRole);
            
            if (isMounted) {
              setProfile(newProfile as Profile);
              setIsLoading(false);
            }
            return;
          }
          
          // Error handling is done in createBasicProfile
          return;
        }
        
        if (profileError) {
          console.error("Profile error:", profileError);
          if (isMounted) {
            toast({
              title: "Ошибка профиля",
              description: "Не удалось загрузить данные профиля",
              variant: "destructive",
            });
            
            if (profileError.code === 'PGRST116') {
              // Profile not found error
              console.log("Profile not found, redirecting to login");
              navigate("/login");
            }
          }
          return;
        }
        
        // Check role match
        if (!checkRoleMatch(profileData, requiredRole, navigate, isMounted)) {
          return;
        }
        
        // Additional profile data based on role
        let additionalData = {};
        
        // If this is a tutor, fetch additional tutor profile data
        if (profileData?.role === 'tutor') {
          const tutorData = await fetchTutorProfileData(user.id);
          
          // Create tutor profile if needed
          if (!tutorData) {
            await createRoleSpecificProfile(user.id, 'tutor');
          } else {
            additionalData = {
              education_institution: tutorData.education_institution,
              degree: tutorData.degree,
              graduation_year: tutorData.graduation_year,
              experience: tutorData.experience,
              methodology: tutorData.methodology
            };
          }
        } 
        // If this is a student, fetch student profile data
        else if (profileData?.role === 'student') {
          const { data: studentData, error: studentError } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
            
          if (studentError && studentError.code !== 'PGRST116') {
            console.error("Error fetching student profile:", studentError);
          } else if (studentData) {
            additionalData = {
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
            await createRoleSpecificProfile(user.id, 'student');
          }
        }
        
        console.log("Profile loaded successfully:", profileData);
        if (isMounted && profileData) {
          // Combine regular profile data with role-specific data
          setProfile({
            ...profileData,
            ...additionalData
          } as Profile);
        }
      } catch (error) {
        console.error("Error in useProfile hook:", error);
        if (isMounted) {
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при загрузке профиля.",
            variant: "destructive",
          });
          navigate("/login");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchProfile();
    
    // Cleanup function to avoid state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [navigate, requiredRole, user, userRole]);

  return { profile, isLoading, updateProfile };
};
