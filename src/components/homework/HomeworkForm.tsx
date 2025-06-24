
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { createHomework } from "@/services/homework/homeworkService";
import { ensureSingleObject } from "@/utils/supabaseUtils";

interface Subject {
  id: string;
  name: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url?: string | null;
}

export const HomeworkForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('student_requests')
          .select(`
            student_id,
            student:profiles!student_id (id, first_name, last_name, avatar_url)
          `)
          .eq('tutor_id', user.id)
          .eq('status', 'accepted');
          
        if (studentsError) throw studentsError;
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('is_active', true);
          
        if (subjectsError) throw subjectsError;
        
        // Process students data
        if (studentsData) {
          const formattedStudents = studentsData.map(item => {
            if (!item.student) return null;
            
            const student = ensureSingleObject(item.student);
            return {
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name || null,
              avatar_url: student.avatar_url
            };
          }).filter(Boolean) as Student[];
          
          setStudents(formattedStudents);
        }
        
        // Process subjects data
        if (subjectsData) {
          setSubjects(subjectsData as Subject[]);
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
    
    fetchData();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !dueDate || !selectedSubjectId || !selectedStudentId) {
      toast({
        title: "Заполните все поля",
        description: "Все поля должны быть заполнены",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Ошибка авторизации",
        description: "Войдите в систему для создания задания",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await createHomework({
        tutor_id: user.id,
        student_id: selectedStudentId,
        subject_id: selectedSubjectId,
        title,
        description,
        due_date: new Date(dueDate).toISOString()
      });
      
      if (error) throw error;
      
      toast({
        title: "Задание создано",
        description: "Ученик получит уведомление о новом задании",
      });
      
      navigate("/profile/tutor");
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка создания",
        description: "Не удалось создать домашнее задание",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создание домашнего задания</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student">Ученик</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ученика" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Предмет</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Название задания</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задания"
              required
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
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">Срок выполнения</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Создание..." : "Создать задание"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
