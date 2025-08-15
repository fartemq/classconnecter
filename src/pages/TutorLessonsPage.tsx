import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { Calendar, Clock, User, Video, BookOpen, Plus, MessageSquare, Presentation, Phone, FileText, ClipboardCheck, NotebookPen } from "lucide-react";
import { format, isToday, isTomorrow, addMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  student_id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  status: string;
  lesson_type: string;
  student_profile: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

interface LessonRequest {
  id: string;
  student_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  status: string;
  message: string;
  created_at: string;
  student_profile: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

const TutorLessonsPage = () => {
  const { user } = useSimpleAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("whiteboard");

  const { data: upcomingLessons = [], refetch: refetchLessons } = useQuery({
    queryKey: ['tutorUpcomingLessons', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          student_id,
          subject_id,
          start_time,
          end_time,
          status,
          lesson_type,
          student_profile:profiles!lessons_student_id_fkey (
            first_name,
            last_name
          ),
          subject:subjects (
            name
          )
        `)
        .eq('tutor_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(lesson => ({
        ...lesson,
        student_profile: Array.isArray(lesson.student_profile) 
          ? lesson.student_profile[0] 
          : lesson.student_profile,
        subject: Array.isArray(lesson.subject) 
          ? lesson.subject[0] 
          : lesson.subject
      })) as Lesson[];
    },
    enabled: !!user?.id
  });

  const { data: lessonRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['tutorLessonRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          id,
          student_id,
          subject_id,
          requested_date,
          requested_start_time,
          requested_end_time,
          status,
          message,
          created_at,
          student_profile:profiles!lesson_requests_student_id_fkey (
            first_name,
            last_name
          ),
          subject:subjects (
            name
          )
        `)
        .eq('tutor_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(request => ({
        ...request,
        student_profile: Array.isArray(request.student_profile) 
          ? request.student_profile[0] 
          : request.student_profile,
        subject: Array.isArray(request.subject) 
          ? request.subject[0] 
          : request.subject
      })) as LessonRequest[];
    },
    enabled: !!user?.id
  });

  const handleJoinLesson = (lessonId: string, startTime: string) => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    if (minutesUntilStart > 15) {
      toast({
        title: "Урок ещё не начался",
        description: `До начала урока осталось ${minutesUntilStart} минут`,
        variant: "destructive"
      });
      return;
    }

    navigate(`/lesson/${lessonId}`);
  };

  const handleApproveRequest = async (requestId: string, request: LessonRequest) => {
    try {
      // Create lesson from request
      const startDateTime = new Date(`${request.requested_date}T${request.requested_start_time}`);
      const endDateTime = new Date(`${request.requested_date}T${request.requested_end_time}`);

      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          tutor_id: user?.id,
          student_id: request.student_id,
          subject_id: request.subject_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'confirmed',
          lesson_type: 'regular'
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Update request status
      const { error: updateError } = await supabase
        .from('lesson_requests')
        .update({ 
          status: 'confirmed',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: "Заявка одобрена",
        description: "Урок создан и студент получит уведомление",
      });

      refetchRequests();
      refetchLessons();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить заявку",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Заявка отклонена",
        description: "Студент получит уведомление об отказе",
      });

      refetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить заявку",
        variant: "destructive"
      });
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'dd MMMM', { locale: ru });
  };

  const canJoinLesson = (startTime: string) => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    return minutesUntilStart <= 15 && minutesUntilStart >= -60;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждён';
      case 'pending': return 'Ожидает';
      case 'canceled':
      case 'cancelled': return 'Отменён';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Инструменты для занятий
              </h1>
              <p className="text-muted-foreground">
                Используйте инструменты для эффективного проведения уроков
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="whiteboard" className="flex items-center gap-2">
                  <Presentation className="h-4 w-4" />
                  Доска
                </TabsTrigger>
                <TabsTrigger value="call" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Звонок
                </TabsTrigger>
                <TabsTrigger value="homework" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Домашнее задание
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Тест
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4" />
                  Конспект
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="whiteboard" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Presentation className="w-5 h-5" />
                      <span>Интерактивная доска</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Presentation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Интерактивная доска</h3>
                      <p className="text-sm text-gray-600 mb-4">Создавайте схемы, решайте задачи и объясняйте материал на виртуальной доске</p>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Presentation className="w-4 h-4 mr-2" />
                        Открыть доску
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="call" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Видеосвязь</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Видеосвязь с учениками</h3>
                      <p className="text-sm text-gray-600 mb-4">Проводите уроки в режиме реального времени с качественным видео и аудио</p>
                      <div className="flex gap-3 justify-center">
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <Video className="w-4 h-4 mr-2" />
                          Начать звонок
                        </Button>
                        <Button variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Только аудио
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="homework" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Домашние задания</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Управление заданиями</h3>
                      <p className="text-sm text-gray-600 mb-4">Создавайте, отправляйте и проверяйте домашние задания</p>
                      <div className="flex gap-3 justify-center">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Создать задание
                        </Button>
                        <Button variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Просмотреть сданные
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ClipboardCheck className="w-5 h-5" />
                      <span>Тестирование</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Создание тестов</h3>
                      <p className="text-sm text-gray-600 mb-4">Создавайте интерактивные тесты для проверки знаний студентов</p>
                      <div className="flex gap-3 justify-center">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Создать тест
                        </Button>
                        <Button variant="outline">
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Результаты тестов
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <NotebookPen className="w-5 h-5" />
                      <span>Конспекты уроков</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <NotebookPen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Ведение конспектов</h3>
                      <p className="text-sm text-gray-600 mb-4">Создавайте и делитесь конспектами уроков со студентами</p>
                      <div className="flex gap-3 justify-center">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Новый конспект
                        </Button>
                        <Button variant="outline">
                          <NotebookPen className="w-4 h-4 mr-2" />
                          Мои конспекты
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default TutorLessonsPage;