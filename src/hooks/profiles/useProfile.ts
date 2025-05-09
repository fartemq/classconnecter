
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from "./types";
import { 
  createBasicProfile, 
  createRoleSpecificProfile, 
  fetchTutorProfileData,
  checkRoleMatch 
} from "./profileUtils";

export const useProfile = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

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
        
        // If this is a tutor, fetch additional tutor profile data
        let tutorData = null;
        if (profileData?.role === 'tutor') {
          tutorData = await fetchTutorProfileData(user.id);
          
          // Create tutor profile if needed
          if (!tutorData) {
            await createRoleSpecificProfile(user.id, 'tutor');
            tutorData = await fetchTutorProfileData(user.id);
          }
        }
        
        console.log("Profile loaded successfully:", profileData);
        if (isMounted && profileData) {
          // Combine regular profile data with tutor profile data if available
          setProfile({
            ...profileData,
            ...(tutorData && {
              education_institution: tutorData.education_institution,
              degree: tutorData.degree,
              graduation_year: tutorData.graduation_year,
              experience: tutorData.experience,
              methodology: tutorData.methodology
            })
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

  return { profile, isLoading };
};
