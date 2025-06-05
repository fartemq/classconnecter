import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Clock, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileUpload } from "@/components/common/FileUpload";

interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  created_at: string;
  tutor_id: string;
  subject_id: string;
  materials: Array<{ path: string; name: string }>;
  answer_files: Array<{ path: string; name: string }>;
  subjects: { name: string } | null;
  tutor: { first_name: string; last_name: string } | null;
}

export const StudentHomeworkView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState<{ [key: string]: string }>({});
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user?.id) {
      fetchHomework();
    }
  }, [user?.id]);

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
          tutor_id,
          subject_id,
          materials,
          answer_files,
          subjects(name),
          tutor:profiles!tutor_id(first_name, last_name)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: HomeworkItem[] = (data || []).map(item => ({
        ...item,
        materials: item.materials || [],
        answer_files: item.answer_files || [],
        subjects: Array.isArray(item.subjects) && item.subjects.length > 0 
          ? item.subjects[0] 
          : null,
        tutor: Array.isArray(item.tutor) && item.tutor.length > 0 
          ? item.tutor[0] 
          : null
      }));
      
      setHomework(transformedData);
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

  const submitHomework = async (homeworkId: string) => {
    const submission = submissionText[homeworkId];
    const homeworkItem = homework.find(h => h.id === homeworkId);
    
    if (!submission?.trim() && (!homeworkItem?.answer_files || homeworkItem.answer_files.length === 0)) {
      toast({
        title: "Ошибка",
        description: "Введите ответ или прикрепите файлы",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .update({ 
          status: 'submitted',
          feedback: submission || null
        })
        .eq('id', homeworkId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Домашнее задание отправлено на проверку"
      });

      await fetchHomework();
      setSubmissionText(prev => ({ ...prev, [homeworkId]: '' }));
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить задание",
        variant: "destructive"
      });
    }
  };

  const handleFileUploaded = async (homeworkId: string, filePath: string, fileName: string) => {
    try {
      const homeworkItem = homework.find(h => h.id === homeworkId);
      const currentFiles = homeworkItem?.answer_files || [];
      const newFiles = [...currentFiles, { path: filePath, name: fileName }];

      const { error } = await supabase
        .from('homework')
        .update({ answer_files: newFiles })
        .eq('id', homeworkId);

      if (error) throw error;

      await fetchHomework();
    } catch (error) {
      console.error('Error updating homework files:', error);
    }
  };

  const handleFileRemoved = async (homeworkId: string, filePath: string) => {
    try {
      const homeworkItem = homework.find(h => h.id === homeworkId);
      const currentFiles = homeworkItem?.answer_files || [];
      const newFiles = currentFiles.filter(f => f.path !== filePath);

      const { error } = await supabase
        .from('homework')
        .update({ answer_files: newFiles })
        .eq('id', homeworkId);

      if (error) throw error;

      await fetchHomework();
    } catch (error) {
      console.error('Error removing homework file:', error);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('homework-materials')
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

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'assigned';
    
    if (isOverdue) {
      return <Badge variant="destructive">Просрочено</Badge>;
    }
    
    switch (status) {
      case 'assigned':
        return <Badge variant="outline">К выполнению</Badge>;
      case 'submitted':
        return <Badge variant="default">На проверке</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Проверено</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Завершено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isSubmittable = (status: string) => {
    return status === 'assigned';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Домашние задания</h1>
          <p className="text-gray-600">Задания от ваших репетиторов</p>
        </div>
        <Badge variant="outline" className={`${isMobile ? 'text-sm px-2 py-1' : 'text-lg px-3 py-1'}`}>
          <FileText className="h-4 w-4 mr-2" />
          {homework.length}
        </Badge>
      </div>

      {homework.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет домашних заданий</h3>
            <p className="text-gray-500">
              Когда репетиторы назначат вам задания, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {homework.map((item) => {
            const isOverdue = new Date(item.due_date) < new Date() && item.status === 'assigned';
            
            return (
              <Card key={item.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader className={isMobile ? 'pb-3' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-3'} mb-2`}>
                        <CardTitle className={`${isMobile ? 'text-lg' : 'text-lg'}`}>{item.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status, item.due_date)}
                          {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                      
                      <div className={`flex ${isMobile ? 'flex-col space-y-1' : 'items-center space-x-4'} text-sm text-gray-500`}>
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {item.subjects?.name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Срок: {format(new Date(item.due_date), 'dd MMM yyyy HH:mm', { locale: ru })}
                        </span>
                        {item.tutor && (
                          <span>
                            Репетитор: {item.tutor.first_name} {item.tutor.last_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {item.description && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Описание задания:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                    </div>
                  )}

                  {/* Материалы от репетитора */}
                  {item.materials && item.materials.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Материалы для изучения:</h4>
                      <div className="space-y-2">
                        {item.materials.map((material, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(material.path, material.name)}
                            className="flex items-center"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {material.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isSubmittable(item.status) && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ваш ответ:
                        </label>
                        <Textarea
                          value={submissionText[item.id] || ''}
                          onChange={(e) => setSubmissionText(prev => ({ 
                            ...prev, 
                            [item.id]: e.target.value 
                          }))}
                          placeholder="Введите ваш ответ или решение..."
                          rows={isMobile ? 3 : 4}
                          className={isMobile ? 'text-base' : ''}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Прикрепить файлы с ответами:
                        </label>
                        <FileUpload
                          bucket="homework-answers"
                          folder={user?.id || ''}
                          onFileUploaded={(filePath, fileName) => handleFileUploaded(item.id, filePath, fileName)}
                          onFileRemoved={(filePath) => handleFileRemoved(item.id, filePath)}
                          existingFiles={item.answer_files}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          maxFiles={5}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => submitHomework(item.id)}
                        className={`flex items-center ${isMobile ? 'w-full' : ''}`}
                        size={isMobile ? "lg" : "default"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Отправить на проверку
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Создано: {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
