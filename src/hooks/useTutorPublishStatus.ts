
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
  }>({ isValid: true, missingFields: [] });
  const { user } = useAuth();
  
  useEffect(() => {
    const checkPublishStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Проверка статуса публикации
        const { data, error } = await supabase
          .from("tutor_profiles")
          .select("is_published")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        // Если данные существуют, устанавливаем статус публикации
        setIsPublished(data?.is_published || false);
        
        // Проверка полноты профиля
        const validationResult = await validateTutorProfile(user.id);
        setProfileStatus({
          isValid: validationResult.isValid,
          missingFields: validationResult.missingFields
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
      setIsLoading(true);
      
      const newStatus = !isPublished;
      
      // При попытке публикации, сначала проверяем полноту профиля
      if (newStatus) {
        const validationResult = await validateTutorProfile(user.id);
        
        if (!validationResult.isValid) {
          const missingFieldsText = validationResult.missingFields.join(", ");
          toast({
            title: "Профиль не готов к публикации",
            description: `Пожалуйста, заполните следующие поля: ${missingFieldsText}`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      // Проверить существование записи tutor_profiles
      const { data: existingProfile } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
        
      if (!existingProfile) {
        // Создать запись, если она отсутствует
        const { error: createError } = await supabase
          .from("tutor_profiles")
          .insert({
            id: user.id,
            is_published: newStatus,
            updated_at: new Date().toISOString()
          });
          
        if (createError) throw createError;
      } else {
        // Обновление статуса публикации
        const { error } = await supabase
          .from("tutor_profiles")
          .update({
            is_published: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
        
        if (error) throw error;
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
