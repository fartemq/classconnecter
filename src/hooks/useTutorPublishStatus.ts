import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateTutorProfile, 
  publishTutorProfile 
} from '@/services/tutor';

/**
 * Hook for managing tutor profile publication status
 */
export const useTutorPublishStatus = (tutorId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Validate profile and check publish status
  useEffect(() => {
    const checkStatus = async () => {
      if (!tutorId) return;
      
      try {
        setLoading(true);
        const validation = await validateTutorProfile(tutorId);
        
        setIsValid(validation.isValid);
        setMissingFields(validation.missingFields);
        setWarnings(validation.warnings);
        
        // Get current publish status
        const { data } = await supabase
          .from('tutor_profiles')
          .select('is_published')
          .eq('id', tutorId)
          .single();
          
        setIsPublished(!!data?.is_published);
      } catch (error) {
        console.error('Error checking publish status:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось проверить статус публикации профиля',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [tutorId]);

  // Function to toggle publish status
  const togglePublishStatus = async () => {
    if (!tutorId) {
      toast({
        title: 'Ошибка',
        description: 'ID профиля не найден',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // If trying to publish, check if valid first
      if (!isPublished && !isValid) {
        toast({
          title: 'Профиль не готов к публикации',
          description: 'Заполните все необходимые поля профиля',
          variant: 'destructive',
        });
        return false;
      }
      
      // Toggle publish status
      const success = await publishTutorProfile(tutorId, !isPublished);
      
      if (success) {
        setIsPublished(!isPublished);
        
        toast({
          title: isPublished ? 'Профиль снят с публикации' : 'Профиль опубликован',
          description: isPublished 
            ? 'Ваш профиль больше не виден студентам'
            : 'Теперь студенты могут находить вас в поиске',
        });
        
        return true;
      } else {
        throw new Error('Failed to update publish status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус публикации',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isPublished,
    isValid,
    missingFields,
    warnings,
    loading,
    togglePublishStatus,
  };
};
