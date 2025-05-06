
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Slider } from "@/components/ui/slider";
import { Homework } from "@/types/homework";
import { fetchHomeworkById, gradeHomework } from "@/services/homeworkService";

const HomeworkGrading = () => {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [grade, setGrade] = useState<number[]>([7]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const getHomeworkDetails = async () => {
      try {
        setLoading(true);
        
        if (!homeworkId) return;
        
        const homeworkData = await fetchHomeworkById(homeworkId);
        
        if (!homeworkData) {
          throw new Error("Failed to fetch homework data");
        }
        
        setHomework(homeworkData);
        if (homeworkData.grade !== null) {
          setGrade([homeworkData.grade]);
        }
        if (homeworkData.feedback) {
          setFeedback(homeworkData.feedback);
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
    
    getHomeworkDetails();
  }, [homeworkId, navigate, toast]);
  
  const handleDownloadFile = async (path: string | null, bucket: string) => {
    if (!path) return;
    
    try {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .download(path);
        
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = path.split('/').pop() || 'file';
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
    
    if (!homeworkId) return;
    
    try {
      setSaving(true);
      
      const { error } = await gradeHomework(homeworkId, grade[0], feedback);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Успех",
        description: "Домашнее задание успешно оценено.",
      });
      
      // Update local state
      if (homework) {
        setHomework({
          ...homework,
          grade: grade[0],
          feedback,
          status: 'graded'
        });
      }
    } catch (error) {
      console.error('Error grading homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось оценить домашнее задание. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
  
  const isSubmitted = homework.status === 'submitted';
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{homework.title}</CardTitle>
            <CardDescription>
              {homework.subject?.name} • {homework.student?.first_name} {homework.student?.last_name}
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
              onClick={() => handleDownloadFile(homework.file_path, 'homework_files')}
              className="text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать файл задания
            </Button>
          </div>
        )}
        
        {/* Student's answer */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Ответ студента:</h3>
          
          {homework.answer ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-700">
              {homework.answer}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 italic">
              Текстовый ответ не предоставлен
            </div>
          )}
          
          {homework.answer_file_path && (
            <Button
              variant="outline"
              onClick={() => handleDownloadFile(homework.answer_file_path, 'homework_answers')}
              className="text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать файл ответа
            </Button>
          )}
        </div>
        
        {/* Grading section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Оценка работы:</h3>
          
          {homework.status === 'graded' ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-4 space-y-2">
              <div className="flex justify-between">
                <span>Оценка:</span>
                <span className="font-bold">{homework.grade}/10</span>
              </div>
              
              <div>
                <h4 className="font-medium">Комментарий:</h4>
                <p className="text-gray-700">{homework.feedback || "Без комментария"}</p>
              </div>
            </div>
          ) : homework.status !== 'submitted' ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500">
              Студент еще не отправил ответ
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="grade">Оценка: {grade[0]}/10</Label>
                </div>
                
                <Slider
                  id="grade"
                  min={1}
                  max={10}
                  step={1}
                  value={grade}
                  onValueChange={setGrade}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">Комментарий</Label>
                <Textarea 
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Введите комментарий к оценке"
                  rows={4}
                />
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
                  disabled={saving || !isSubmitted}
                >
                  {saving ? "Сохранение..." : "Оценить работу"}
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
      </CardFooter>
    </Card>
  );
};

export default HomeworkGrading;
