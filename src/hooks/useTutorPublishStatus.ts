
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { validateTutorProfile, publishTutorProfile } from "@/services/tutor";

export const useTutorPublishStatus = () => {
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }>({ isValid: true, missingFields: [], warnings: [] });
  const { user } = useAuth();
  
  const dismissAlert = () => {
    setAlertDismissed(true);
  };
  
  useEffect(() => {
    const checkPublishStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Checking publish status for user:", user.id);
        
        // Проверка статуса публикации
        const { data, error } = await supabase
          .from("tutor_profiles")
          .select("is_published")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching publish status:", error);
          // Не выбрасываем ошибку, если tutor_profiles не найден (код PGRST116)
          if (error.code !== 'PGRST116') {
            throw error;
          }
        }
        
        // Если данные существуют, устанавливаем статус публикации
        console.log("Publish status data:", data);
        setIsPublished(data?.is_published || false);
        
        // Проверка полноты профиля
        const validationResult = await validateTutorProfile(user.id);
        console.log("Validation result:", validationResult);
        setProfileStatus({
          isValid: validationResult.isValid,
          missingFields: validationResult.missingFields,
          warnings: validationResult.warnings
        });
        
      } catch (error) {
        console.error("Error checking publish status:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось проверить статус публикации профиля",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPublishStatus();
  }, [user?.id]);
  
  const togglePublishStatus = async () => {
    if (!user?.id) return false;
    
    try {
      console.log("Toggling publish status for user:", user.id);
      setIsLoading(true);
      
      const newStatus = !isPublished;
      
      // При попытке публикации, сначала проверяем полноту профиля
      if (newStatus) {
        const validationResult = await validateTutorProfile(user.id);
        console.log("Validation before publishing:", validationResult);
        
        if (!validationResult.isValid) {
          const missingFieldsText = validationResult.missingFields.join(", ");
          toast({
            title: "Профиль не готов к публикации",
            description: `Пожалуйста, заполните следующие поля: ${missingFieldsText}`,
            variant: "destructive",
          });
          setProfileStatus(validationResult);
          setIsLoading(false);
          return false;
        }
      }
      
      // Publish or unpublish profile
      const success = await publishTutorProfile(user.id, newStatus);
      
      if (success) {
        setIsPublished(newStatus);
        toast({
          title: newStatus ? "Профиль опубликован" : "Профиль снят с публикации",
          description: newStatus 
            ? "Теперь студенты могут видеть ваш профиль и связываться с вами" 
            : "Ваш профиль больше не виден студентам",
          variant: newStatus ? "default" : "destructive",
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
  };
  
  return {
    isPublished,
    isLoading,
    togglePublishStatus,
    profileStatus,
    alertDismissed,
    dismissAlert
  };
};
