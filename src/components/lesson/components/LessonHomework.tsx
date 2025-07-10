import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  BookOpen, 
  Send, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LessonHomeworkProps {
  lessonId: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  file_path?: string;
  due_date?: string;
  status: string;
  answer?: string;
  answer_file_path?: string;
  grade?: number;
  feedback?: string;
  tutor: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

export const LessonHomework = ({ lessonId }: LessonHomeworkProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHomework();
  }, [lessonId]);

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          tutor:profiles!homework_tutor_id_fkey(first_name, last_name),
          subject:subjects(name)
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const handleAnswerSubmit = async (homeworkId: string) => {
    if (!answer.trim() && !answerFile) {
      toast({
        title: "Ошибка",
        description: "Введите ответ или прикрепите файл",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let answerFilePath = null;

      if (answerFile) {
        const fileExt = answerFile.name.split('.').pop();
        const fileName = `${homeworkId}_answer_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('materials')
          .upload(fileName, answerFile);

        if (uploadError) throw uploadError;
        answerFilePath = uploadData.path;
      }

      const { error } = await supabase
        .from('homework')
        .update({
          answer: answer.trim() || null,
          answer_file_path: answerFilePath,
          status: 'submitted'
        })
        .eq('id', homeworkId);

      if (error) throw error;

      toast({
        title: "Ответ отправлен",
        description: "Ваш ответ успешно отправлен преподавателю",
      });

      setAnswer('');
      setAnswerFile(null);
      setSelectedHomework(null);
      fetchHomework();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('materials')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'assigned': { variant: 'secondary' as const, text: 'Назначено', icon: BookOpen },
      'submitted': { variant: 'default' as const, text: 'Отправлено', icon: Send },
      'graded': { variant: 'default' as const, text: 'Оценено', icon: CheckCircle },
      'overdue': { variant: 'destructive' as const, text: 'Просрочено', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (homework.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>Домашние задания не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid gap-4">
        {homework.map((hw) => (
          <Card key={hw.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{hw.title}</CardTitle>
                {getStatusBadge(hw.status)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <span>{hw.subject.name}</span>
                <span>•</span>
                <span>{hw.tutor.first_name} {hw.tutor.last_name}</span>
                {hw.due_date && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(hw.due_date).toLocaleDateString('ru-RU')}
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {hw.description && (
                <p className="text-sm">{hw.description}</p>
              )}

              {hw.file_path && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadFile(hw.file_path!, hw.title)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Скачать материалы
                </Button>
              )}

              {hw.status === 'graded' && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Оценка: {hw.grade}/10</span>
                  </div>
                  {hw.feedback && (
                    <p className="text-sm text-muted-foreground">{hw.feedback}</p>
                  )}
                </div>
              )}

              {hw.status === 'assigned' && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Введите ваш ответ..."
                    value={selectedHomework?.id === hw.id ? answer : ''}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setSelectedHomework(hw);
                    }}
                    className="min-h-24"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) => {
                        setAnswerFile(e.target.files?.[0] || null);
                        setSelectedHomework(hw);
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAnswerSubmit(hw.id)}
                      disabled={loading || (!answer.trim() && !answerFile)}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Отправить
                    </Button>
                  </div>
                </div>
              )}

              {(hw.status === 'submitted' || hw.status === 'graded') && hw.answer && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Ваш ответ:</h4>
                  <p className="text-sm">{hw.answer}</p>
                  {hw.answer_file_path && (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => downloadFile(hw.answer_file_path!, 'Ответ')}
                      className="mt-2 p-0 h-auto flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Скачать прикрепленный файл
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};