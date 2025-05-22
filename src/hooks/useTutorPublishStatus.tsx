
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateTutorProfile, 
  publishTutorProfile,
  getTutorPublicationStatus 
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
      let profileId = tutorId;
      
      if (!profileId && user?.id) {
        profileId = user.id;
      }
      
      if (!profileId) {
        console.log("No profile ID available to check");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log("Checking publication status for profile ID:", profileId);
        
        // Get the comprehensive status
        const status = await getTutorPublicationStatus(profileId);
        
        console.log("Publication status result:", status);
        
        setIsValid(status.isValid);
        setMissingFields(status.missingFields);
        setWarnings(status.warnings);
        setIsPublished(status.isPublished);
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
  }, [tutorId, user?.id]);

  // Function to toggle publish status
  const togglePublishStatus = async () => {
    let profileId = tutorId;
    
    if (!profileId && user?.id) {
      profileId = user.id;
    }
    
    if (!profileId) {
      toast({
        title: 'Ошибка',
        description: 'ID профиля не найден',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log(`Attempting to ${isPublished ? 'unpublish' : 'publish'} profile ID:`, profileId);
      
      // If trying to publish, check if valid first
      if (!isPublished && !isValid) {
        toast({
          title: 'Профиль не готов к публикации',
          description: `Заполните все необходимые поля профиля: ${missingFields.join(', ')}`,
          variant: 'destructive',
        });
        return false;
      }
      
      // Toggle publish status
      const success = await publishTutorProfile(profileId, !isPublished);
      
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
