
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define Subject type
interface Subject {
  id: string;
  name: string;
}

// Define Student type
interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url?: string | null;
}

const HomeworkAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudentsAndSubjects = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('student_requests')
          .select(`
            student_id,
            student:profiles!student_id (id, first_name, last_name, avatar_url)
          `)
          .eq('tutor_id', userData.user.id)
          .eq('status', 'accepted');
          
        if (studentsError) throw studentsError;
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name');
          
        if (subjectsError) throw subjectsError;
        
        // Process students data
        if (studentsData) {
          const formattedStudents = studentsData.map(item => {
            if (!item.student) return null;
            return {
              id: item.student.id,
              first_name: item.student.first_name,
              last_name: item.student.last_name,
              avatar_url: item.student.avatar_url
            };
          }).filter(Boolean) as Student[];
          
          setStudents(formattedStudents);
          if (formattedStudents.length > 0) {
            setSelectedStudentId(formattedStudents[0].id);
          }
        }
        
        // Process subjects data
        if (subjectsData) {
          setSubjects(subjectsData);
          if (subjectsData.length > 0) {
            setSelectedSubjectId(subjectsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить необходимые данные",
          variant: "destructive"
        });
      }
    };
    
    fetchStudentsAndSubjects();
  }, [toast]);

  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !dueDate || !selectedSubjectId || !selectedStudentId) {
      toast({
        title: "Заполните все поля",
        description: "Все поля должны быть заполнены",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Ошибка авторизации",
          description: "Войдите в систему для назначения домашнего задания",
          variant: "destructive"
        });
        return;
      }
      
      // Format due date to ISO
      const formattedDueDate = new Date(dueDate).toISOString();
      
      // Create homework
      const { data, error } = await supabase
        .from('homework')
        .insert({
          title,
          description,
          due_date: formattedDueDate,
          subject_id: selectedSubjectId,
          student_id: selectedStudentId,
          tutor_id: userData.user.id,
          status: 'assigned'
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Задание назначено",
        description: "Ученик получит уведомление о новом задании",
      });
      
      navigate("/profile/tutor");
    } catch (error) {
      console.error('Error assigning homework:', error);
      toast({
        title: "Ошибка назначения",
        description: "Не удалось назначить домашнее задание",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Назначение домашнего задания</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssignHomework} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student">Ученик</Label>
            <select
              id="student"
              className="w-full p-2 border rounded"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name || ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Предмет</Label>
            <select
              id="subject"
              className="w-full p-2 border rounded"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Название задания</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задания"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание задания</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите задание"
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Назначение..." : "Назначить задание"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HomeworkAssignment;
