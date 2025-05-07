
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { fetchLessonsByDate } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";

export const useLessons = (date: Date | undefined) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!date) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      // Format date as ISO string for the database query
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Use our service to fetch lessons
      const lessonsData = await fetchLessonsByDate(userData.user.id, dateStr);
      setLessons(lessonsData || []);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      setError(error.message || 'Failed to fetch lessons');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    setLessons,
    refreshLessons: fetchLessons,
    isLoading,
    error
  };
};
