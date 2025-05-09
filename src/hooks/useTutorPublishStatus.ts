
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

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
          
        if (error) throw error;
        
        // Если данные существуют, устанавливаем статус публикации
        setIsPublished(data?.is_published || false);
        
        // Проверка полноты профиля
        // Импортируем функцию validateTutorProfile из файла tutorProfileService
        // Но вызовем ее напрямую через window, чтобы избежать циклических зависимостей
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, last_name, bio, city, avatar_url")
            .eq("id", user.id)
            .single();
            
          if (profileError) throw profileError;
          
          // Проверка профиля репетитора
          const { data: tutorData, error: tutorError } = await supabase
            .from("tutor_profiles")
            .select("education_institution, degree, experience")
            .eq("id", user.id)
            .maybeSingle();
            
          if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;
          
          // Проверка предметов
          const { data: subjectsData, error: subjectsError } = await supabase
            .from("tutor_subjects")
            .select("id")
            .eq("tutor_id", user.id);
            
          if (subjectsError) throw subjectsError;
          
          const missingFields: string[] = [];
          
          // Проверка обязательных полей
          if (!profileData.first_name) missingFields.push("Имя");
          if (!profileData.last_name) missingFields.push("Фамилия");
          if (!profileData.bio) missingFields.push("О себе");
          if (!profileData.city) missingFields.push("Город");
          if (!profileData.avatar_url) missingFields.push("Фотография профиля");
          
          if (!tutorData || !tutorData.education_institution) missingFields.push("Учебное заведение");
          if (!tutorData || !tutorData.degree) missingFields.push("Специальность");
          
          if (!subjectsData || subjectsData.length === 0) {
            missingFields.push("Предметы обучения");
          }
          
          setProfileStatus({
            isValid: missingFields.length === 0,
            missingFields
          });
        } catch (error) {
          console.error("Error checking profile completeness:", error);
        }
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
      if (newStatus && !profileStatus.isValid) {
        const missingFieldsText = profileStatus.missingFields.join(", ");
        toast({
          title: "Профиль не готов к публикации",
          description: `Пожалуйста, заполните следующие поля: ${missingFieldsText}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Обновление статуса публикации
      const { error } = await supabase
        .from("tutor_profiles")
        .update({
          is_published: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
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
