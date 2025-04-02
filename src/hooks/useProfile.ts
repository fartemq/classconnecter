
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  phone: string | null; // Added missing phone property
  role: string;
}

export const useProfile = (requiredRole?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Check if user role matches required role if specified
        if (requiredRole && profileData.role !== requiredRole) {
          toast({
            title: "Доступ запрещен",
            description: `Эта страница доступна только для ${requiredRole === "student" ? "студентов" : "репетиторов"}.`,
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setProfile(profileData as Profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке профиля.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate, requiredRole]);

  return { profile, isLoading };
};
