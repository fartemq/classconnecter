
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Profile } from "./types";
import { checkRoleMatch, createBasicProfile } from "./profileUtils";

export const useBaseProfile = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Common profile loading functionality
  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 3;
    
    const fetchProfile = async () => {
      try {
        if (isMounted) setIsLoading(true);
        
        // Check if user is authenticated
        if (!user) {
          console.log("No active session found, redirecting to login");
          if (isMounted) {
            setError("Требуется авторизация");
            // Add a small delay before redirect to avoid issues with fast transitions
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
          const defaultRole = requiredRole || "student";
          const newProfile = await createBasicProfile(user, defaultRole);
            
          if (newProfile) {
            if (isMounted) {
              setProfile(newProfile as Profile);
              setIsLoading(false);
              setError(null);
            }
            return;
          }
          return;
        }
        
        if (profileError) {
          console.error("Profile error:", profileError);
          attempts++;
          
          if (attempts < maxAttempts) {
            // Try again after a short delay
            setTimeout(fetchProfile, 1000);
            return;
          }
          
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
        console.error("Error in useBaseProfile hook:", error);
        if (isMounted) {
          setError("Произошла ошибка при загрузке профиля");
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при загрузке профиля.",
            variant: "destructive",
          });
          // Add delay before redirect
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
  };
};
