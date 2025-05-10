
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { validateTutorProfile } from "@/services/tutorProfileValidation";

export const useTutorPublishStatus = () => {
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<{
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  }>({ isValid: true, missingFields: [], warnings: [] });
  const { user } = useAuth();
  
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
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching publish status:", error);
          throw error;
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
          setIsLoading(false);
          return false;
        }
      }
      
      // Проверить существование записи tutor_profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      
      console.log("Existing profile check:", existingProfile, checkError);
        
      if (!existingProfile) {
        // Создать запись, если она отсутствует
        console.log("Creating new tutor profile record");
        const { error: createError } = await supabase
          .from("tutor_profiles")
          .insert({
            id: user.id,
            is_published: newStatus,
            updated_at: new Date().toISOString()
          });
          
        if (createError) {
          console.error("Error creating tutor profile:", createError);
          throw createError;
        }
      } else {
        // Обновление статуса публикации
        console.log("Updating existing tutor profile");
        const { error } = await supabase
          .from("tutor_profiles")
          .update({
            is_published: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
        
        if (error) {
          console.error("Error updating publish status:", error);
          throw error;
        }
      }
      
      setIsPublished(newStatus);
      toast({
        title: newStatus ? "Профиль опубликован" : "Профиль снят с публикации",
        description: newStatus 
          ? "Теперь студенты могут видеть ваш профиль и связываться с вами" 
          : "Ваш профиль больше не виден студентам",
        variant: newStatus ? "default" : "destructive",
      });
      return true;
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
    profileStatus
  };
};
