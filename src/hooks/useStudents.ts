
import { useState, useEffect } from "react";
import { fetchAvailableStudents, fetchMyStudents, sendRequestToStudent } from "@/services/studentService";
import { Student } from "@/types/student";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useStudents = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const [isProfilePublished, setIsProfilePublished] = useState<boolean | null>(null);
  const { user } = useAuth();
  
  const checkPublishStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .select("is_published")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error checking publish status:", error);
        return false;
      }
      
      return data?.is_published || false;
    } catch (error) {
      console.error("Error in checkPublishStatus:", error);
      return false;
    }
  };
  
  const fetchStudents = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Проверяем статус публикации профиля
      const isPublished = await checkPublishStatus(user.id);
      setIsProfilePublished(isPublished);
      
      if (!isPublished) {
        // Если профиль не опубликован, показываем только текущих студентов
        const myData = await fetchMyStudents(user.id);
        setMyStudents(myData);
        setAvailableStudents([]);
      } else {
        // Если профиль опубликован, показываем и доступных, и текущих студентов
        const [availableData, myData] = await Promise.all([
          fetchAvailableStudents(user.id),
          fetchMyStudents(user.id)
        ]);
        
        setAvailableStudents(availableData);
        setMyStudents(myData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список учеников",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStudents();
  }, [user?.id]);
  
  const contactStudent = async (studentId: string, subjectId: string | null = null, message: string | null = null) => {
    if (!user?.id) return false;
    
    // Проверяем, опубликован ли профиль перед отправкой запроса
    if (!isProfilePublished) {
      toast({
        title: "Профиль не опубликован",
        description: "Опубликуйте свой профиль, чтобы связаться со студентами",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await sendRequestToStudent(user.id, studentId, subjectId, message);
    
    if (success) {
      toast({
        title: "Запрос отправлен",
        description: "Студент получит ваш запрос на подключение"
      });
      
      // Обновляем списки студентов
      fetchStudents();
      return true;
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос студенту",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    isLoading,
    availableStudents,
    myStudents,
    isProfilePublished,
    refreshStudents: fetchStudents,
    contactStudent
  };
};
