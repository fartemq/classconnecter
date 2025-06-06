import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BookOpen, Calendar as CalendarIcon, User, Plus, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { ensureSingleObject } from "@/utils/supabaseUtils";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  grade?: number;
  feedback?: string;
  student: Student;
  subject: Subject;
  created_at: string;
}

export const TutorHomeworkManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [newHomework, setNewHomework] = useState({
    studentId: "",
    subjectId: "",
    title: "",
    description: "",
    dueDate: new Date()
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    await Promise.all([
      fetchHomework(),
      fetchStudents(),
      fetchSubjects()
    ]);
    setIsLoading(false);
  };

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          student:student_id (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          subject:subject_id (
            id,
            name
          )
        `)
        .eq('tutor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHomework = data?.map(item => ({
        ...item,
        student: ensureSingleObject(item.student),
        subject: ensureSingleObject(item.subject)
      })) || [];

      setHomework(formattedHomework);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          student:student_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'accepted');

      if (error) throw error;

      const studentList = data?.map(item => ensureSingleObject(item.student)).filter(Boolean) || [];
      setStudents(studentList);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject:subject_id (
            id,
            name
          )
        `)
        .eq('tutor_id', user?.id);

      if (error) throw error;

      const subjectList = data?.map(item => ensureSingleObject(item.subject)).filter(Boolean) || [];
      setSubjects(subjectList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const createHomework = async () => {
    if (!newHomework.studentId || !newHomework.subjectId || !newHomework.title) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          tutor_id: user?.id,
          student_id: newHomework.studentId,
          subject_id: newHomework.subjectId,
          title: newHomework.title,
          description: newHomework.description,
          due_date: newHomework.dueDate.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Домашнее задание создано"
      });

      setShowCreateForm(false);
      setNewHomework({
        studentId: "",
        subjectId: "",
        title: "",
        description: "",
        dueDate: new Date()
      });
      
      fetchHomework();
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать домашнее задание",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Домашние задания</h2>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новое домашнее задание</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Студент *</Label>
                <Select value={newHomework.studentId} onValueChange={(value) => setNewHomework(prev => ({ ...prev, studentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите студента" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Предмет *</Label>
                <Select value={newHomework.subjectId} onValueChange={(value) => setNewHomework(prev => ({ ...prev, subjectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Название задания *</Label>
              <Input
                value={newHomework.title}
                onChange={(e) => setNewHomework(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название задания"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={newHomework.description}
                onChange={(e) => setNewHomework(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите задание..."
                rows={3}
              />
            </div>

            <div>
              <Label>Срок выполнения</Label>
              <Calendar
                mode="single"
                selected={newHomework.dueDate}
                onSelect={(date) => date && setNewHomework(prev => ({ ...prev, dueDate: date }))}
                className="rounded-md border"
                locale={ru}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createHomework}>
                <Send className="h-4 w-4 mr-2" />
                Создать
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {homework.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет домашних заданий</h3>
            <p className="text-gray-500">
              Создайте первое домашнее задание для своих учеников
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {homework.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={hw.student.avatar_url} />
                        <AvatarFallback>
                          {hw.student.first_name?.[0]}{hw.student.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{hw.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {hw.student.first_name} {hw.student.last_name} • {hw.subject.name}
                        </p>
                      </div>
                    </div>
                    
                    {hw.description && (
                      <p className="text-sm text-gray-600 mb-4">{hw.description}</p>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        Срок: {format(new Date(hw.due_date), 'd MMMM yyyy', { locale: ru })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Создано: {format(new Date(hw.created_at), 'd MMMM yyyy', { locale: ru })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {hw.status === 'completed' ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Выполнено
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        В работе
                      </Badge>
                    )}
                    
                    {hw.grade && (
                      <Badge variant="secondary">
                        Оценка: {hw.grade}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {hw.feedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">
                      <strong>Отзыв:</strong> {hw.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
