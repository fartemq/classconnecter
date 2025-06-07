
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BookOpen, 
  Plus, 
  Calendar as CalendarIcon, 
  File, 
  Send,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LessonHomeworkProps {
  lessonId: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  file_path: string | null;
  answer: string | null;
  feedback: string | null;
  grade: number | null;
}

export const LessonHomework = ({ lessonId }: LessonHomeworkProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    due_date: new Date()
  });

  useEffect(() => {
    fetchHomework();
  }, [lessonId]);

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('tutor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const createHomework = async () => {
    try {
      // Get lesson details to find student_id
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('student_id, subject_id')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;

      const { data, error } = await supabase
        .from('homework')
        .insert({
          tutor_id: user?.id,
          student_id: lessonData.student_id,
          subject_id: lessonData.subject_id,
          title: newHomework.title,
          description: newHomework.description,
          due_date: newHomework.due_date.toISOString(),
          status: 'assigned'
        })
        .select()
        .single();

      if (error) throw error;

      setHomework(prev => [data, ...prev]);
      setIsCreating(false);
      setNewHomework({ title: '', description: '', due_date: new Date() });

      toast({
        title: "Домашнее задание создано",
        description: "Задание отправлено ученику",
      });
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать домашнее задание",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'submitted': return 'bg-yellow-500';
      case 'graded': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Назначено';
      case 'submitted': return 'Отправлено';
      case 'graded': return 'Проверено';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Домашние задания</h3>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Новое домашнее задание</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Название задания"
              value={newHomework.title}
              onChange={(e) => setNewHomework(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <Textarea
              placeholder="Описание задания"
              value={newHomework.description}
              onChange={(e) => setNewHomework(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Срок сдачи:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(newHomework.due_date, 'dd MMM yyyy', { locale: ru })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newHomework.due_date}
                    onSelect={(date) => date && setNewHomework(prev => ({ ...prev, due_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createHomework} disabled={!newHomework.title.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Отправить
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 overflow-auto space-y-3">
        {homework.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Нет домашних заданий</p>
            <p className="text-sm">Создайте первое задание для ученика</p>
          </div>
        ) : (
          homework.map(hw => (
            <Card key={hw.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{hw.title}</h4>
                  <Badge className={getStatusColor(hw.status)}>
                    {getStatusText(hw.status)}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{hw.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Срок: {format(new Date(hw.due_date), 'dd MMM yyyy', { locale: ru })}
                  </div>
                  
                  {hw.grade && (
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Оценка: {hw.grade}
                    </div>
                  )}
                </div>
                
                {hw.answer && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium mb-1">Ответ ученика:</p>
                    <p className="text-sm">{hw.answer}</p>
                  </div>
                )}
                
                {hw.feedback && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-sm font-medium mb-1">Обратная связь:</p>
                    <p className="text-sm">{hw.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
