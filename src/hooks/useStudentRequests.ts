
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StudentRequest } from "@/types/student";

export const useStudentRequests = (userId: string | undefined, statusFilter: string[] = ['accepted']) => {
  const [isLoading, setIsLoading] = useState(true);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);

  useEffect(() => {
    if (userId) {
      fetchStudentRequests();
    }
  }, [userId, statusFilter]);

  const fetchStudentRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('student_requests')
        .select(`
          *,
          student:profiles!student_id(id, first_name, last_name, avatar_url, role, city),
          subject:subject_id(id, name)
        `)
        .eq('tutor_id', userId)
        .in('status', statusFilter);
      
      if (error) {
        console.error('Error fetching student requests:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список учеников",
          variant: "destructive"
        });
        return;
      }
      
      setStudentRequests(data as StudentRequest[] || []);
    } catch (err) {
      console.error('Exception fetching student requests:', err);
      toast({
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке данных",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected' | 'completed') => {
    try {
      const { error } = await supabase
        .from('student_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error updating request status:', error);
        toast({
          title: "Ошибка обновления статуса",
          description: "Не удалось обновить статус запроса",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh the list
      fetchStudentRequests();
      
      toast({
        title: "Статус обновлен",
        description: `Запрос успешно ${
          newStatus === 'accepted' ? 'принят' : 
          newStatus === 'rejected' ? 'отклонен' : 'завершен'
        }`,
      });
    } catch (err) {
      console.error('Exception updating request status:', err);
      toast({
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении статуса",
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    studentRequests,
    updateRequestStatus,
    fetchStudentRequests
  };
};
