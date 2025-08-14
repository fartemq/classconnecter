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
import { Calendar, Clock, User, Video, BookOpen, Plus, MessageSquare } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("upcoming");

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
                Мои занятия
              </h1>
              <p className="text-muted-foreground">
                Управляйте своими уроками и заявками студентов
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Предстоящие уроки
                  {upcomingLessons.length > 0 && (
                    <Badge variant="secondary">{upcomingLessons.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Заявки
                  {lessonRequests.length > 0 && (
                    <Badge variant="destructive">{lessonRequests.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Расписание
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>Ближайшие уроки</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingLessons.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Нет запланированных уроков</h3>
                        <p className="text-sm">Уроки появятся здесь после одобрения заявок</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingLessons.map(lesson => (
                          <Card key={lesson.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>{getDateLabel(lesson.start_time)}</span>
                                    <span>
                                      {format(new Date(lesson.start_time), 'HH:mm', { locale: ru })} - 
                                      {format(new Date(lesson.end_time), 'HH:mm', { locale: ru })}
                                    </span>
                                  </div>
                                </div>
                                <Badge className={getStatusColor(lesson.status)}>
                                  {getStatusText(lesson.status)}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">
                                      {lesson.student_profile?.first_name} {lesson.student_profile?.last_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {lesson.subject?.name}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {lesson.status === 'confirmed' && canJoinLesson(lesson.start_time) && (
                                    <Button
                                      onClick={() => handleJoinLesson(lesson.id, lesson.start_time)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Video className="w-4 h-4 mr-2" />
                                      Войти в урок
                                    </Button>
                                  )}
                                  
                                  {lesson.status === 'confirmed' && !canJoinLesson(lesson.start_time) && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="w-3 h-3 mr-1" />
                                      <span>Доступно за 15 мин до урока</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Заявки на уроки</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lessonRequests.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Нет новых заявок</h3>
                        <p className="text-sm">Заявки от студентов появятся здесь</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lessonRequests.map(request => (
                          <Card key={request.id} className="border-l-4 border-l-orange-400">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>{getDateLabel(request.requested_date)}</span>
                                    <span>
                                      {request.requested_start_time.substring(0, 5)} - 
                                      {request.requested_end_time.substring(0, 5)}
                                    </span>
                                  </div>
                                </div>
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  Новая заявка
                                </Badge>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">
                                      {request.student_profile?.first_name} {request.student_profile?.last_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">
                                      {request.subject?.name}
                                    </span>
                                  </div>
                                </div>

                                {request.message && (
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{request.message}</p>
                                  </div>
                                )}

                                <div className="flex items-center space-x-3">
                                  <Button
                                    onClick={() => handleApproveRequest(request.id, request)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Одобрить
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRejectRequest(request.id)}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    Отклонить
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление расписанием</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Button 
                        onClick={() => navigate('/profile/tutor/schedule')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Открыть настройки расписания
                      </Button>
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