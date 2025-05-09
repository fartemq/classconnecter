
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorRequest } from "@/types/student";
import { useToast } from "@/hooks/use-toast";
import { ensureObject } from "@/utils/supabaseUtils";

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
      const transformedData: TutorRequest[] = (data || []).map(item => {
        const tutorData = ensureObject(item.tutor);
        const subjectData = item.subject ? ensureObject(item.subject) : undefined;
        
        return {
          id: item.id,
          tutor_id: item.tutor_id,
          student_id: item.student_id,
          subject_id: item.subject_id || null,
          message: item.message || null,
          status: item.status,
          created_at: item.created_at,
          tutor: {
            id: tutorData.id,
            first_name: tutorData.first_name,
            last_name: tutorData.last_name,
            avatar_url: tutorData.avatar_url,
            role: tutorData.role,
            city: tutorData.city
          },
          subject: subjectData ? {
            id: subjectData.id,
            name: subjectData.name
          } : undefined
        };
      });
      
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
  
  useEffect(() => {
    fetchTutorRequests();
  }, [fetchTutorRequests]);
  
  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      // For implementation in a real database
      const { error } = await supabase
        .from('tutor_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) {
        console.error("Error updating request status:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить статус запроса",
          variant: "destructive"
        });
        return false;
      }
      
      // Update the local state to reflect the change
      setTutorRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status } 
            : request
        )
      );
      
      toast({
        title: status === 'accepted' ? "Запрос принят" : status === 'rejected' ? "Запрос отклонен" : "Запрос завершен",
        description: status === 'accepted' 
          ? "Вы можете связаться с репетитором" 
          : status === 'rejected'
          ? "Репетитор получит уведомление о вашем решении"
          : "Занятие успешно завершено"
      });
      
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
