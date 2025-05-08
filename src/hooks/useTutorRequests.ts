import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorRequest } from "@/types/student";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
}

export const useTutorRequests = (studentId?: string) => {
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();
  
  const fetchTutorRequests = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tutor_requests')
        .select(`
          id,
          tutor_id,
          student_id,
          subject_id,
          message,
          status,
          created_at,
          tutor:profiles!tutor_id (id, first_name, last_name, avatar_url, role, city),
          subject:subjects (id, name)
        `)
        .eq('student_id', studentId);
        
      if (error) {
        console.error("Error fetching tutor requests:", error);
        return;
      }
      
      // Transform the data to match our expected type
      const transformedData: TutorRequest[] = (data || []).map(item => ({
        id: item.id,
        tutor_id: item.tutor_id,
        student_id: item.student_id,
        subject_id: item.subject_id,
        message: item.message,
        status: item.status,
        created_at: item.created_at,
        tutor: item.tutor ? {
          id: item.tutor.id,
          first_name: item.tutor.first_name,
          last_name: item.tutor.last_name,
          avatar_url: item.tutor.avatar_url,
          role: item.tutor.role,
          city: item.tutor.city
        } : undefined,
        subject: item.subject ? {
          id: item.subject.id,
          name: item.subject.name
        } : undefined
      }));
      
      setTutorRequests(transformedData);
      
      // Extract unique subjects for filtering
      const uniqueSubjects = Array.from(
        new Map(
          transformedData
            .filter(req => req.subject)
            .map(req => [req.subject?.id, { id: req.subject?.id || "", name: req.subject?.name || "" }])
        ).values()
      );
      
      setSubjects(uniqueSubjects);
      
    } catch (error) {
      console.error("Error in fetchTutorRequests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);
  
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
    activeTab,
    setActiveTab,
    isLoading,
    updateRequestStatus,
    getStatusCount,
    subjects,
    refresh: fetchTutorRequests
  };
};
