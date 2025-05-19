
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Profile } from "./types";
import { 
  createBasicProfile,
  createRoleSpecificProfile,
  checkRoleMatch 
} from "./utils";

/**
 * Base hook for common profile functionality shared between student and tutor profiles
 */
export const useProfileCommon = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
            setError("Требуется авторизация");
            setTimeout(() => {
              if (isMounted) {
                toast({
                  title: "Требуется авторизация",
                  description: "Пожалуйста, войдите в систему для продолжения.",
                  variant: "destructive",
                });
                navigate("/login");
              }
            }, 100);
          }
          return;
        }
        
        // Get user profile from database
        console.log("Fetching profile for user:", user.id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        // If profile doesn't exist yet, create a basic one
        if (!profileData && !profileError) {
          // Cast defaultRole to either "student" or "tutor"
          const defaultRole = requiredRole === "student" || requiredRole === "tutor" 
            ? requiredRole as "student" | "tutor"
            : "student";  // Default to student if role is invalid
            
          const newProfile = await createBasicProfile(user, defaultRole);
          await createRoleSpecificProfile(user.id, defaultRole);
            
          if (newProfile && isMounted) {
            setProfile(newProfile as Profile);
            setIsLoading(false);
            setError(null);
          }
          return;
        }
        
        if (profileError) {
          console.error("Profile error:", profileError);
          
          if (isMounted) {
            setError("Не удалось загрузить данные профиля");
            toast({
              title: "Ошибка профиля",
              description: "Не удалось загрузить данные профиля",
              variant: "destructive",
            });
            
            if (profileError.code === 'PGRST116') {
              navigate("/login");
            }
          }
          return;
        }
        
        // Check role match
        if (!checkRoleMatch(profileData, requiredRole, navigate, isMounted)) {
          setError("Неправильный тип профиля");
          return;
        }

        console.log("Basic profile data loaded:", profileData);
        
        if (isMounted) {
          setProfile({
            ...profileData,
            created_at: profileData.created_at || null,
            updated_at: profileData.updated_at || null
          } as Profile);
          setError(null);
        }
      } catch (error) {
        console.error("Error in useProfileCommon hook:", error);
        if (isMounted) {
          setError("Произошла ошибка при загрузке профиля");
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при загрузке профиля.",
            variant: "destructive",
          });
          setTimeout(() => {
            if (isMounted) {
              navigate("/login");
            }
          }, 100);
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

  return {
    profile,
    setProfile,
    isLoading,
    error,
    user,
    userRole
  };
};
