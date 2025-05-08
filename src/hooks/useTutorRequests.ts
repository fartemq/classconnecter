
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TutorRequest } from '@/types/student';
import { toast } from '@/hooks/use-toast';

export const useTutorRequests = (userId: string | undefined) => {
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [subjects, setSubjects] = useState<Array<{id: string, name: string}>>([]);
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        
        // For now, we'll fetch data from the messages table as a proxy for requests
        // In a real implementation, you'd have a dedicated tutor_requests table
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            created_at,
            sender:sender_id(first_name, last_name, avatar_url)
          `)
          .eq('receiver_id', userId)
          .eq('subject', 'Запрос на подключение')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching requests:", error);
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить запросы от репетиторов",
            variant: "destructive"
          });
          return;
        }
        
        // Convert messages to TutorRequest format
        const requests = data?.map(message => ({
          id: message.id,
          tutor_id: message.sender_id,
          student_id: message.receiver_id,
          status: 'pending', // All messages are pending by default
          created_at: message.created_at,
          tutor: message.sender
        })) || [];
        
        setTutorRequests(requests);
        
        // Fetch available subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');
          
        setSubjects(subjectsData || []);
        
      } catch (err) {
        console.error("Error in fetchRequests:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [userId]);
  
  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      // In a real implementation, you'd update a tutor_requests table
      // For now, we'll just show a toast to simulate the action
      toast({
        title: status === 'accepted' ? "Запрос принят" : "Запрос отклонен",
        description: status === 'accepted' 
          ? "Вы можете связаться с репетитором" 
          : "Репетитор получит уведомление о вашем решении"
      });
      
      // Update the local state to reflect the change
      setTutorRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status } 
            : request
        )
      );
      
      return true;
    } catch (err) {
      console.error("Error updating request status:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус запроса",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const getStatusCount = (status: string) => {
    if (status === 'all') return tutorRequests.length;
    return tutorRequests.filter(req => req.status === status).length;
  };
  
  return {
    tutorRequests,
    isLoading,
    activeTab,
    setActiveTab,
    updateRequestStatus,
    getStatusCount,
    subjects
  };
};
