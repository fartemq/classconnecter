
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, Calendar, Clock, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
  subject_id: string;
  subjects: { name: string } | null;
}

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export const TutorHomeworkManagement = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    subject_id: "",
    due_date: ""
  });

  useEffect(() => {
    if (studentId && user?.id) {
      fetchStudentInfo();
      fetchHomework();
      fetchSubjects();
    }
  }, [studentId, user?.id]);

  const fetchStudentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudentInfo(data);
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию об ученике",
        variant: "destructive"
      });
    }
  };

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('homework')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          created_at,
          subject_id,
          subjects!inner(name)
        `)
        .eq('tutor_id', user?.id)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить домашние задания",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const createHomework = async () => {
    if (!newHomework.title || !newHomework.subject_id || !newHomework.due_date) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          tutor_id: user?.id,
          student_id: studentId,
          subject_id: newHomework.subject_id,
          title: newHomework.title,
          description: newHomework.description,
          due_date: newHomework.due_date,
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Домашнее задание создано"
      });

      setNewHomework({ title: "", description: "", subject_id: "", due_date: "" });
      setShowCreateForm(false);
      await fetchHomework();
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать домашнее задание",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="outline">Назначено</Badge>;
      case 'submitted':
        return <Badge variant="default">Отправлено</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Проверено</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Завершено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!studentId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Выберите ученика для управления домашними заданиями</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile/tutor/students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к ученикам
          </Button>
          
          {studentInfo && (
            <div>
              <h1 className="text-2xl font-bold">
                Домашние задания для {studentInfo.first_name} {studentInfo.last_name}
              </h1>
            </div>
          )}
        </div>

        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новое домашнее задание</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Название задания *</Label>
                <Input
                  id="title"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название задания"
                />
              </div>
              <div>
                <Label htmlFor="subject">Предмет *</Label>
                <Select 
                  value={newHomework.subject_id} 
                  onValueChange={(value) => setNewHomework(prev => ({ ...prev, subject_id: value }))}
                >
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
            </div>

            <div>
              <Label htmlFor="due_date">Срок выполнения *</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={newHomework.due_date}
                onChange={(e) => setNewHomework(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Описание задания</Label>
              <Textarea
                id="description"
                value={newHomework.description}
                onChange={(e) => setNewHomework(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите задание подробно..."
                rows={4}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={createHomework} disabled={isCreating}>
                {isCreating ? "Создание..." : "Создать задание"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homework List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Домашние задания
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : homework.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Пока нет домашних заданий</p>
              <p className="text-sm">Создайте первое задание для этого ученика</p>
            </div>
          ) : (
            <div className="space-y-4">
              {homework.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {item.subjects?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Срок: {format(new Date(item.due_date), 'dd MMM yyyy HH:mm', { locale: ru })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Создано: {format(new Date(item.created_at), 'dd MMM yyyy', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
