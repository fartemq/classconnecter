
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, User, BookOpen, FileText, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { fetchHomeworkById, submitHomework } from "@/services/homework/homeworkService";
import { uploadHomeworkAnswer } from "@/services/homework/fileUploadService";
import { useAuth } from "@/hooks/auth/useAuth";
import { Homework } from "@/types/homework";

const HomeworkSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
        setAnswer(data.answer || "");
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!homework || !user) return;
    
    if (!answer.trim() && selectedFiles.length === 0) {
      toast({
        title: "Пустой ответ",
        description: "Добавьте текст ответа или прикрепите файлы",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFiles: string[] = [];
      
      // Загружаем файлы
      for (const file of selectedFiles) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `answers/${homework.id}/${fileName}`;
        
        const { path, error } = await uploadHomeworkAnswer(file, filePath);
        if (error) {
          throw new Error(`Ошибка загрузки файла ${file.name}`);
        }
        if (path) {
          uploadedFiles.push(path);
        }
      }
      
      const success = await submitHomework(homework.id, answer, uploadedFiles);
      if (success) {
        toast({
          title: "Работа отправлена",
          description: "Ваш ответ успешно отправлен на проверку",
        });
        setHomework(prev => prev ? {
          ...prev,
          answer,
          answer_files: uploadedFiles,
          status: 'submitted'
        } : null);
      } else {
        throw new Error('Не удалось отправить ответ');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось отправить ответ",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
  const canSubmit = homework.status === 'assigned' && !isOverdue;

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
              
              {homework.tutor && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{homework.tutor.first_name} {homework.tutor.last_name}</span>
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

            {isOverdue && homework.status === 'assigned' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">Срок выполнения задания истек</p>
              </div>
            )}

            {canSubmit ? (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Ваш ответ</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="answer">Текст ответа</Label>
                    <Textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Введите ваш ответ..."
                      rows={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="files">Прикрепить файлы</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Поддерживаются файлы: PDF, DOC, DOCX, TXT, JPG, PNG
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Выбранные файлы:</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!answer.trim() && selectedFiles.length === 0)}
                    className="w-full"
                  >
                    {isSubmitting ? "Отправка..." : "Отправить ответ"}
                  </Button>
                </div>
              </div>
            ) : homework.status === 'submitted' ? (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Ваш ответ (отправлен)</h3>
                <div className="space-y-4">
                  {homework.answer && (
                    <div className="p-4 bg-blue-50 rounded">
                      <p className="whitespace-pre-wrap">{homework.answer}</p>
                    </div>
                  )}
                  
                  {homework.answer_files && homework.answer_files.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Прикрепленные файлы:</h4>
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
                </div>
              </div>
            ) : homework.status === 'graded' && (
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

export default HomeworkSubmission;
