
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null;
  role: string;
  school?: string | null;
  grade?: string | null;
  // Tutor profile specific fields
  education_institution?: string | null;
  degree?: string | null;
  graduation_year?: number | null;
  experience?: number | null;
  methodology?: string | null;
}

export const useProfile = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
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
          .single();
        
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
        
        // If this is a tutor, fetch additional tutor profile data
        let tutorData = null;
        if (profileData?.role === 'tutor') {
          const { data: tutorProfileData, error: tutorProfileError } = await supabase
            .from("tutor_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          
          if (!tutorProfileError && tutorProfileData) {
            tutorData = tutorProfileData;
          }
        }
        
        // Check if user role matches required role if specified
        if (requiredRole && profileData && profileData.role !== requiredRole) {
          console.log(`User role (${profileData.role}) doesn't match required role (${requiredRole})`);
          if (isMounted) {
            toast({
              title: "Доступ запрещен",
              description: `Эта страница доступна только для ${requiredRole === "student" ? "студентов" : "репетиторов"}.`,
              variant: "destructive",
            });
            navigate("/");
          }
          return;
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
  }, [navigate, requiredRole, user]);

  return { profile, isLoading };
};
