
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { fetchLessonsByDate } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";

export const useLessons = (date: Date | undefined) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const fetchLessons = useCallback(async () => {
    if (!date) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      // Format date as ISO string for the database query
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Use our service to fetch lessons
      const lessonsData = await fetchLessonsByDate(userData.user.id, dateStr);
      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  }, [date]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    setLessons,
    refreshLessons: fetchLessons
  };
};
