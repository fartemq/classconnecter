
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Lesson } from "@/types/lesson";
import { ensureSingleObject } from "@/utils/supabaseUtils";

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
      
      // Fetch lessons directly using Supabase
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          tutor_id,
          student_id,
          subject_id,
          start_time,
          end_time,
          status,
          created_at,
          updated_at,
          student:profiles!student_id (id, first_name, last_name, avatar_url),
          tutor:profiles!tutor_id (id, first_name, last_name, avatar_url),
          subject:subjects (id, name)
        `)
        .eq('tutor_id', userData.user.id)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`);
      
      if (error) throw error;
      
      // Process the data and set lessons
      if (data) {
        // Transform the data to match our Lesson type
        const transformedLessons: Lesson[] = data.map(item => {
          const student = ensureSingleObject(item.student);
          const tutor = ensureSingleObject(item.tutor);
          const subject = ensureSingleObject(item.subject);
          
          // Extract time from the start_time
          const startTime = new Date(item.start_time);
          const timeString = format(startTime, 'HH:mm:ss');
          
          // Calculate duration in minutes
          const endTime = new Date(item.end_time);
          const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
          
          return {
            id: item.id,
            tutor_id: item.tutor_id,
            student_id: item.student_id,
            subject_id: item.subject_id,
            date: format(startTime, 'yyyy-MM-dd'),
            time: timeString,
            duration: durationMinutes,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            student: student ? {
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              avatar_url: student.avatar_url
            } : undefined,
            tutor: tutor ? {
              id: tutor.id,
              first_name: tutor.first_name,
              last_name: tutor.last_name,
              avatar_url: tutor.avatar_url
            } : undefined,
            subject: subject ? {
              id: subject.id,
              name: subject.name
            } : undefined
          };
        });
        
        setLessons(transformedLessons);
      }
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
