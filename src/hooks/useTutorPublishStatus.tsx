
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { publishTutorProfile } from "@/services/tutorProfileService";
import { validateTutorProfile } from "@/services/tutorProfileValidation";
import { toast } from "@/hooks/use-toast";

export const useTutorPublishStatus = () => {
  const { user } = useAuth();
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }>({
    isValid: false,
    missingFields: [],
    warnings: []
  });
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Check if profile is published
  useEffect(() => {
    const checkPublishStatus = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        console.log("Checking publish status for user:", user.id);

        // Fetch tutor profile
        const { data, error } = await supabaseClient
          .from("tutor_profiles")
          .select("is_published")
          .eq("id", user.id)
          .maybeSingle();

        console.log("Publish status data:", data);

        if (error) {
          console.error("Error fetching publish status:", error);
          return;
        }

        // Check if profile exists and is published
        setIsPublished(!!data?.is_published);

        // Validate profile completeness
        const validationResult = await validateTutorProfile(user.id);
        console.log("Validation result:", validationResult);
        setProfileStatus(validationResult);

      } catch (error) {
        console.error("Error checking publish status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPublishStatus();
  }, [user?.id]);

  // Function to toggle publish status
  const togglePublishStatus = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Ошибка",
        description: "Необходимо авторизоваться",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      // If trying to publish, validate first
      if (!isPublished) {
        const validationResult = await validateTutorProfile(user.id);
        
        if (!validationResult.isValid) {
          toast({
            title: "Профиль не готов к публикации",
            description: "Заполните все необходимые поля профиля",
            variant: "destructive",
          });
          setProfileStatus(validationResult);
          return false;
        }
      }

      // Update publish status in database
      const success = await publishTutorProfile(user.id, !isPublished);
      
      if (success) {
        setIsPublished(!isPublished);
        
        toast({
          title: isPublished ? "Профиль снят с публикации" : "Профиль опубликован",
          description: isPublished 
            ? "Ваш профиль больше не виден студентам" 
            : "Теперь студенты могут находить вас в поиске",
        });
        
        return true;
      } else {
        throw new Error("Не удалось изменить статус публикации");
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус публикации",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPublished, user?.id]);

  const dismissAlert = useCallback(() => {
    setAlertDismissed(true);
  }, []);

  return {
    isPublished,
    isLoading,
    togglePublishStatus,
    profileStatus,
    alertDismissed,
    dismissAlert
  };
};

// Utility function to get profile publication status without the full hook
export const getTutorPublicationStatus = async (tutorId: string): Promise<{
  isPublished: boolean;
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}> => {
  try {
    const { data } = await supabaseClient
      .from("tutor_profiles")
      .select("is_published")
      .eq("id", tutorId)
      .maybeSingle();
      
    const validationResult = await validateTutorProfile(tutorId);
    
    return {
      isPublished: !!data?.is_published,
      isValid: validationResult.isValid,
      missingFields: validationResult.missingFields,
      warnings: validationResult.warnings
    };
  } catch (error) {
    console.error("Error getting publication status:", error);
    return {
      isPublished: false,
      isValid: false,
      missingFields: ["Ошибка проверки профиля"],
      warnings: []
    };
  }
};

// Fix: Import supabase client
import { supabase as supabaseClient } from "@/integrations/supabase/client";
