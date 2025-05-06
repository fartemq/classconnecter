
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string | null;
  created_at: string;
  updated_at: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export const useTutorRequests = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  useEffect(() => {
    if (userId) {
      fetchTutorRequests();
    }
  }, [userId, activeTab]);
  
  const fetchTutorRequests = async () => {
    try {
      setIsLoading(true);
      
      const statusFilter = activeTab === 'all' 
        ? ['pending', 'accepted', 'rejected', 'completed'] 
        : [activeTab];
      
      const { data, error } = await supabase
        .from('student_requests')
        .select(`
          *,
          tutor:profiles!tutor_id(id, first_name, last_name, avatar_url, role, city),
          subject:subject_id(id, name)
        `)
        .eq('student_id', userId)
        .in('status', statusFilter);
      
      if (error) {
        console.error('Error fetching tutor requests:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список запросов от репетиторов",
          variant: "destructive"
        });
        return;
      }
      
      setTutorRequests(data as TutorRequest[] || []);
    } catch (err) {
      console.error('Exception fetching tutor requests:', err);
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
      fetchTutorRequests();
      
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
  
  const getStatusCount = (status: string) => {
    return tutorRequests.filter(req => 
      status === 'all' ? true : req.status === status
    ).length;
  };

  return {
    isLoading,
    tutorRequests,
    activeTab,
    setActiveTab,
    updateRequestStatus,
    getStatusCount,
  };
};
