
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { confirmLesson, cancelLesson } from "@/services/lessonBookingService";

interface LessonRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  status: string;
  message?: string;
  tutor_response?: string;
  created_at: string;
  student?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  tutor?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  subject?: {
    name: string;
  };
}

export const useLessonRequests = (userId: string | undefined, userRole: 'student' | 'tutor') => {
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('lesson_requests')
        .select(`
          *,
          student:profiles!lesson_requests_student_id_fkey(first_name, last_name, email, avatar_url),
          tutor:profiles!lesson_requests_tutor_id_fkey(first_name, last_name, email, avatar_url),
          subject:subjects(name)
        `);

      if (userRole === 'tutor') {
        query = query.eq('tutor_id', userId);
      } else {
        query = query.eq('student_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data?.map(req => ({
        ...req,
        student: Array.isArray(req.student) ? req.student[0] : req.student,
        tutor: Array.isArray(req.tutor) ? req.tutor[0] : req.tutor,
        subject: Array.isArray(req.subject) ? req.subject[0] : req.subject,
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching lesson requests:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить запросы на занятия",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createLessonRequest = async (requestData: {
    tutor_id: string;
    subject_id: string;
    requested_date: string;
    requested_start_time: string;
    requested_end_time: string;
    message?: string;
  }) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: userId,
          ...requestData,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на занятие отправлен репетитору",
      });

      fetchRequests(); // Обновляем список
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

  const respondToRequest = async (requestId: string, action: 'accept' | 'reject', response?: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return false;

      if (action === 'accept') {
        // Создаем урок при принятии запроса
        const startDateTime = `${request.requested_date}T${request.requested_start_time}`;
        const endDateTime = `${request.requested_date}T${request.requested_end_time}`;

        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            student_id: request.student_id,
            tutor_id: request.tutor_id,
            subject_id: request.subject_id,
            start_time: startDateTime,
            end_time: endDateTime,
            status: 'confirmed'
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // Обновляем связь студент-репетитор
        const { error: relationError } = await supabase
          .from('student_tutor_relationships')
          .upsert({
            student_id: request.student_id,
            tutor_id: request.tutor_id,
            status: 'accepted',
            start_date: new Date().toISOString()
          }, {
            onConflict: 'student_id,tutor_id'
          });

        if (relationError) {
          console.error('Error updating relationship:', relationError);
        }
      }

      // Обновляем статус запроса
      const { error } = await supabase
        .from('lesson_requests')
        .update({ 
          status: action === 'accept' ? 'confirmed' : 'rejected',
          tutor_response: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: action === 'accept' ? "Запрос принят" : "Запрос отклонен",
        description: action === 'accept' 
          ? "Занятие добавлено в ваше расписание" 
          : "Запрос на занятие отклонен",
      });

      fetchRequests();
      return true;
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать запрос",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    requests,
    loading,
    createLessonRequest,
    respondToRequest,
    refreshRequests: fetchRequests
  };
};
