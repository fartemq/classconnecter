
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { Calendar, Clock, User, Plus, Video, Phone } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
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
  student_profile: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

export const ScheduleManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: upcomingLessons = [], refetch } = useQuery({
    queryKey: ['upcomingLessons', user?.id],
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
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
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

  const handleJoinLesson = (lessonId: string, startTime: string) => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    // Разрешаем войти за 15 минут до начала
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

  const handleConfirmLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Урок подтверждён",
        description: "Студент получит уведомление о подтверждении",
      });

      refetch();
    } catch (error) {
      console.error("Error confirming lesson:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить урок",
        variant: "destructive"
      });
    }
  };

  const handleCancelLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Урок отменён",
        description: "Студент получит уведомление об отмене",
      });

      refetch();
    } catch (error) {
      console.error("Error canceling lesson:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить урок",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждён';
      case 'pending': return 'Ожидает';
      case 'canceled': return 'Отменён';
      default: return status;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Расписание</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/profile/tutor/schedule?edit=1')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Создать/редактировать расписание
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Добавить урок
          </Button>
        </div>
      </div>

      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Ближайшие уроки</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingLessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Нет запланированных уроков</p>
              <p className="text-sm">Запросы на уроки появятся здесь</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-start space-x-4">
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
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {lesson.student_profile?.first_name} {lesson.student_profile?.last_name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {lesson.subject?.name}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {lesson.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirmLesson(lesson.id)}
                          >
                            Подтвердить
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelLesson(lesson.id)}
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                      
                      {lesson.status === 'confirmed' && canJoinLesson(lesson.start_time) && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinLesson(lesson.id, lesson.start_time)}
                          className="flex items-center space-x-1"
                        >
                          <Video className="w-4 h-4" />
                          <span>Войти в урок</span>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
