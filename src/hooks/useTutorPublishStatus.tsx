
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateTutorProfile, 
  publishTutorProfile,
  getTutorPublicationStatus 
} from '@/services/tutor';

// Cache for publication status
const statusCache = new Map<string, { status: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useTutorPublishStatus = (tutorId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const getCachedStatus = useCallback((profileId: string) => {
    const cached = statusCache.get(profileId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.status;
    }
    return null;
  }, []);

  const setCachedStatus = useCallback((profileId: string, status: any) => {
    statusCache.set(profileId, { status, timestamp: Date.now() });
  }, []);

  const checkStatus = useCallback(async () => {
    let profileId = tutorId;
    
    if (!profileId && user?.id) {
      profileId = user.id;
    }
    
    if (!profileId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Check cache first
      const cachedStatus = getCachedStatus(profileId);
      if (cachedStatus) {
        setIsValid(cachedStatus.isValid);
        setMissingFields(cachedStatus.missingFields);
        setWarnings(cachedStatus.warnings);
        setIsPublished(cachedStatus.isPublished);
        setLoading(false);
        return;
      }
      
      const status = await getTutorPublicationStatus(profileId);
      
      // Cache the result
      setCachedStatus(profileId, status);
      
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
  }, [tutorId, user?.id, getCachedStatus, setCachedStatus, toast]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const togglePublishStatus = useCallback(async () => {
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
      
      if (!isPublished && !isValid) {
        toast({
          title: 'Профиль не готов к публикации',
          description: `Заполните все необходимые поля профиля: ${missingFields.join(', ')}`,
          variant: 'destructive',
        });
        return false;
      }
      
      const success = await publishTutorProfile(profileId, !isPublished);
      
      if (success) {
        setIsPublished(!isPublished);
        
        // Clear cache to force refresh
        statusCache.delete(profileId);
        
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
  }, [tutorId, user?.id, isPublished, isValid, missingFields, toast]);

  return {
    isPublished,
    isValid,
    missingFields,
    warnings,
    loading,
    togglePublishStatus,
    refreshStatus: checkStatus,
  };
};
