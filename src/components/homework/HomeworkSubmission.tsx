
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, Download, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface Homework {
  id: string;
  title: string;
  description: string;
  file_path: string | null;
  due_date: string;
  created_at: string;
  status: string;
  answer: string | null;
  answer_file_path: string | null;
  grade: number | null;
  feedback: string | null;
  subject: { 
    name: string;
  };
  tutor: {
    first_name: string;
    last_name: string | null;
  };
}

const HomeworkSubmission = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('homework')
          .select(`
            id,
            title,
            description,
            file_path,
            due_date,
            created_at,
            status,
            answer,
            answer_file_path,
            grade,
            feedback,
            subject:subject_id(name),
            tutor:tutor_id(first_name, last_name)
          `)
          .eq('id', homeworkId)
          .single();
          
        if (error) {
          throw error;
        }
        
        setHomework(data as Homework);
        if (data.answer) {
          setAnswer(data.answer);
        }
      } catch (error) {
        console.error('Error fetching homework:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить домашнее задание.",
          variant: "destructive"
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    
    if (homeworkId) {
      fetchHomework();
    }
  }, [homeworkId, navigate, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDownloadFile = async () => {
    if (!homework?.file_path) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('homework_files')
        .download(homework.file_path);
        
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = homework.file_path.split('/').pop() || 'homework_file';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл.",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadAnswerFile = async () => {
    if (!homework?.answer_file_path) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from('homework_answers')
        .download(homework.answer_file_path);
        
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = homework.answer_file_path.split('/').pop() || 'answer_file';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл.",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer && !file) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите ответ или прикрепите файл.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      let answerFilePath = homework?.answer_file_path;
      
      // If there's a file, upload it
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${homework?.id}-${Date.now()}.${fileExt}`;
        const filePath = `homework_answers/${fileName}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('homework_answers')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        answerFilePath = filePath;
      }
      
      // Update homework with answer
      const { error: updateError } = await supabase
        .from('homework')
        .update({ 
          answer,
          answer_file_path: answerFilePath,
          status: 'submitted'
        })
        .eq('id', homework?.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Успех",
        description: "Ответ успешно отправлен.",
      });
      
      // Update local state
      if (homework) {
        setHomework({
          ...homework,
          answer,
          answer_file_path: answerFilePath,
          status: 'submitted'
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-6">
          <Loader className="h-8 w-8" />
        </CardContent>
      </Card>
    );
  }
  
  if (!homework) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Задание не найдено</p>
          <Button 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Вернуться
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const isOverdue = new Date(homework.due_date) < new Date();
  const canSubmit = homework.status !== 'graded' && !isOverdue;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <CardDescription>
              {homework.subject.name} • {homework.tutor.first_name} {homework.tutor.last_name}
            </CardDescription>
          </div>
          <Badge className={
            homework.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
            homework.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }>
            {homework.status === 'assigned' ? 'Назначено' : 
             homework.status === 'submitted' ? 'На проверке' : 'Проверено'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Due date */}
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          <div>
            Срок сдачи: {format(new Date(homework.due_date), "d MMMM yyyy", { locale: ru })}
            {isOverdue && " • Просрочено"}
          </div>
        </div>
        
        {/* Assignment description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Задание:</h3>
          <div className="bg-gray-50 p-4 rounded-md text-gray-700">
            {homework.description}
          </div>
        </div>
        
        {/* Attached file if any */}
        {homework.file_path && (
          <div>
            <Button
              variant="outline"
              onClick={handleDownloadFile}
              className="text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать прикрепленный файл
            </Button>
          </div>
        )}
        
        {/* Graded section */}
        {homework.status === 'graded' && (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-medium">Оценка:</h3>
              <span className="font-bold">{homework.grade}/10</span>
            </div>
            {homework.feedback && (
              <div>
                <h3 className="font-medium">Комментарий преподавателя:</h3>
                <p className="text-gray-700">{homework.feedback}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Answer section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Ваш ответ:</h3>
          
          {homework.status !== 'assigned' ? (
            <>
              <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                {homework.answer || "Ответ не был предоставлен"}
              </div>
              {homework.answer_file_path && (
                <Button
                  variant="outline"
                  onClick={handleDownloadAnswerFile}
                  className="text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать прикрепленный файл ответа
                </Button>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Введите ваш ответ"
                rows={5}
              />
              
              <div>
                <Label htmlFor="answer-file">Прикрепить файл (необязательно)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="answer-file"
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById('answer-file')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {file && (
                  <p className="text-sm text-gray-500 mt-1">
                    Выбран файл: {file.name}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !canSubmit}
                >
                  {submitting ? "Отправка..." : "Отправить"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          Назад
        </Button>
        
        {homework.status === 'submitted' && (
          <Button variant="outline" disabled>
            Ожидает проверки
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HomeworkSubmission;
