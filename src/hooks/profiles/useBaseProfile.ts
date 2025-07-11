
import { useState, useEffect } from "react";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export interface BaseProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  phone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export const useBaseProfile = (expectedRole?: string) => {
  const { user, userRole, isLoading: authLoading } = useSimpleAuth();
  const [profile, setProfile] = useState<BaseProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setIsLoading(false);
      setProfile(null);
      return;
    }

    // Check role mismatch
    if (expectedRole && userRole && userRole !== expectedRole) {
      const errorMsg = `Неверная роль пользователя. Ожидается: ${expectedRole}, получено: ${userRole}`;
      logger.warn("Role mismatch", "base-profile", { expected: expectedRole, actual: userRole });
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    fetchProfile();
  }, [user, userRole, expectedRole, authLoading]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          logger.debug("Profile not found, creating", "base-profile");
          await createProfile();
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      logger.error("Error fetching profile", "base-profile", error);
      setError(error instanceof Error ? error.message : "Ошибка загрузки профиля");
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user?.id) return;

    try {
      const profileData = {
        id: user.id,
        first_name: "",
        last_name: "",
        role: expectedRole || "student",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      logger.info("Profile created successfully", "base-profile");
    } catch (error) {
      logger.error("Error creating profile", "base-profile", error);
      setError("Не удалось создать профиль");
      toast({
        title: "Ошибка",
        description: "Не удалось создать профиль",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    setProfile,
    isLoading,
    error,
    user,
    refetch: fetchProfile
  };
};
