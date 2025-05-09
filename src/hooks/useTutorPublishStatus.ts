
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { publishTutorProfile } from "@/services/tutorProfileService";

export const useTutorPublishStatus = () => {
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const checkPublishStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("tutor_profiles")
          .select("is_published")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // If data exists, set the published status
        setIsPublished(data?.is_published || false);
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
      const success = await publishTutorProfile(user.id, newStatus);
      
      if (success) {
        setIsPublished(newStatus);
        toast({
          title: newStatus ? "Профиль опубликован" : "Профиль снят с публикации",
          description: newStatus 
            ? "Теперь студенты могут видеть ваш профиль" 
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
    togglePublishStatus
  };
};
