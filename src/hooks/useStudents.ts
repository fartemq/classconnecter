
import { useState, useEffect } from "react";
import { fetchAvailableStudents, fetchMyStudents, sendRequestToStudent } from "@/services/studentService";
import { Student } from "@/types/student";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const useStudents = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const { user } = useAuth();
  
  const fetchStudents = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [availableData, myData] = await Promise.all([
        fetchAvailableStudents(user.id),
        fetchMyStudents(user.id)
      ]);
      
      setAvailableStudents(availableData);
      setMyStudents(myData);
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
    refreshStudents: fetchStudents,
    contactStudent
  };
};
