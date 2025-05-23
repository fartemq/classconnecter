
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LessonRequest, CreateLessonRequestData } from "@/types/lessonRequest";
import { useToast } from "@/hooks/use-toast";

export const useLessonRequests = (userId: string | undefined, userRole: 'student' | 'tutor') => {
  const [lessonRequests, setLessonRequests] = useState<LessonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLessonRequests = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const field = userRole === 'student' ? 'student_id' : 'tutor_id';
      const otherField = userRole === 'student' ? 'tutor' : 'student';
      const otherUserId = userRole === 'student' ? 'tutor_id' : 'student_id';
      
      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          *,
          ${otherField}:profiles!${otherUserId} (id, first_name, last_name, avatar_url),
          subject:subjects (id, name)
        `)
        .eq(field, userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLessonRequests(data as LessonRequest[] || []);
    } catch (error) {
      console.error('Error fetching lesson requests:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить запросы на занятия",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonRequests();
  }, [userId, userRole]);

  const createLessonRequest = async (data: CreateLessonRequestData): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          ...data,
          student_id: userId
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на занятие отправлен репетитору"
      });

      fetchLessonRequests();
      return true;
    } catch (error) {
      console.error('Error creating lesson request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на занятие",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateLessonRequestStatus = async (
    requestId: string, 
    status: 'confirmed' | 'rejected' | 'cancelled',
    response?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { 
        status,
        responded_at: new Date().toISOString()
      };
      
      if (response) {
        updateData.tutor_response = response;
      }

      const { error } = await supabase
        .from('lesson_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      const statusText = status === 'confirmed' ? 'подтвержден' : 
                        status === 'rejected' ? 'отклонен' : 'отменен';

      toast({
        title: "Статус обновлен",
        description: `Запрос на занятие ${statusText}`
      });

      fetchLessonRequests();
      return true;
    } catch (error) {
      console.error('Error updating lesson request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус запроса",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    lessonRequests,
    isLoading,
    createLessonRequest,
    updateLessonRequestStatus,
    refetch: fetchLessonRequests
  };
};
