
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, User, BookOpen, FileText, Upload } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { fetchHomeworkById, gradeHomework } from "@/services/homework/homeworkService";
import { uploadHomeworkAnswer, getFileUrl } from "@/services/homework/fileUploadService";
import { useAuth } from "@/hooks/auth/useAuth";
import { Homework } from "@/types/homework";

const HomeworkAssignment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const loadHomework = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await fetchHomeworkById(id);
        if (error || !data) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить задание",
            variant: "destructive"
          });
          return;
        }
        setHomework(data);
        setFeedback(data.feedback || "");
        setGrade(data.grade?.toString() || "");
      } catch (error) {
        console.error('Error loading homework:', error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке задания",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHomework();
  }, [id, toast]);

  const handleGradeSubmit = async () => {
    if (!homework || !user) return;
    
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 5) {
      toast({
        title: "Неверная оценка",
        description: "Оценка должна быть от 1 до 5",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await gradeHomework(homework.id, gradeNum, feedback);
      if (success) {
        toast({
          title: "Оценка выставлена",
          description: "Работа успешно оценена",
        });
        setHomework(prev => prev ? {
          ...prev,
          grade: gradeNum,
          feedback,
          status: 'graded'
        } : null);
      } else {
        throw new Error('Не удалось выставить оценку');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выставить оценку",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `answers/${homework?.id}/${fileName}`;
    
    const { path, error } = await uploadHomeworkAnswer(file, filePath);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    return path;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Задание не найдено</p>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue = homework.due_date && new Date(homework.due_date) < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <Badge className={getStatusColor(homework.status)}>
            {getStatusText(homework.status)}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{homework.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {homework.subject && (
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{homework.subject.name}</span>
                </div>
              )}
              
              {homework.student && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{homework.student.first_name} {homework.student.last_name}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {homework.due_date 
                    ? format(new Date(homework.due_date), 'dd MMM yyyy HH:mm', { locale: ru })
                    : 'Без срока'
                  }
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Описание задания</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
            </div>

            {homework.materials && homework.materials.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Материалы</h3>
                <div className="space-y-2">
                  {homework.materials.map((material, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{material}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {homework.answer && (
              <div>
                <h3 className="font-medium mb-2">Ответ студента</h3>
                <div className="p-4 bg-blue-50 rounded">
                  <p className="whitespace-pre-wrap">{homework.answer}</p>
                </div>
              </div>
            )}

            {homework.answer_files && homework.answer_files.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Файлы ответа</h3>
                <div className="space-y-2">
                  {homework.answer_files.map((file, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {homework.status === 'submitted' && user?.userRole === 'tutor' && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Оценить работу</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="grade">Оценка (1-5)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Введите оценку"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback">Комментарий</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Ваш комментарий к работе..."
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGradeSubmit}
                    disabled={isSubmitting || !grade}
                    className="w-full"
                  >
                    {isSubmitting ? "Сохранение..." : "Выставить оценку"}
                  </Button>
                </div>
              </div>
            )}

            {homework.status === 'graded' && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Результат</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded">
                    <span className="font-medium">Оценка:</span>
                    <span className="text-xl font-bold text-green-700">{homework.grade}</span>
                  </div>
                  
                  {homework.feedback && (
                    <div>
                      <Label className="font-medium">Комментарий преподавателя:</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded">
                        <p className="whitespace-pre-wrap">{homework.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeworkAssignment;
