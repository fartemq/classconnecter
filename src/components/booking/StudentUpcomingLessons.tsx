import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { format, isToday, isTomorrow, isAfter, subMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen, Video, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface Lesson {
  id: string;
  tutor_id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  status: string;
  tutor: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
}

export const StudentUpcomingLessons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['studentUpcomingLessons', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          tutor_id,
          subject_id,
          start_time,
          end_time,
          status,
          tutor:profiles!lessons_tutor_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subjects (
            name
          )
        `)
        .eq('student_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tutor: Array.isArray(item.tutor) ? item.tutor[0] : item.tutor,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject
      })) as Lesson[];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Подтверждено</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ожидает подтверждения</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Скоро</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'dd MMMM', { locale: ru });
  };

  const canJoinLesson = (startTime: string, status: string) => {
    if (status !== 'confirmed' && status !== 'upcoming') return false;
    
    const now = new Date();
    const lessonStart = new Date(startTime);
    const joinWindow = subMinutes(lessonStart, 15); // Can join 15 minutes before
    
    return isAfter(now, joinWindow) && !isAfter(now, lessonStart);
  };

  const handleJoinLesson = (lessonId: string, startTime: string) => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    
    if (!canJoinLesson(startTime, 'confirmed')) {
      const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
      toast({
        title: "Урок ещё не начался",
        description: minutesUntil > 0 
          ? `До начала урока осталось ${minutesUntil} минут`
          : "Время для входа в урок истекло",
        variant: "destructive"
      });
      return;
    }

    navigate(`/lesson/${lessonId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие уроки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lessons.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Предстоящие уроки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У вас нет запланированных уроков</p>
            <p className="text-sm">Забронируйте урок с репетитором</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предстоящие уроки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.map(lesson => (
            <div key={lesson.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {lesson.tutor?.first_name} {lesson.tutor?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {lesson.subject?.name}
                    </span>
                  </div>
                </div>
                {getStatusBadge(lesson.status)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{getDateLabel(lesson.start_time)}</span>
                  <span>
                    {format(new Date(lesson.start_time), 'HH:mm', { locale: ru })} - 
                    {format(new Date(lesson.end_time), 'HH:mm', { locale: ru })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {canJoinLesson(lesson.start_time, lesson.status) && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinLesson(lesson.id, lesson.start_time)}
                      className="flex items-center space-x-1"
                    >
                      <Video className="w-4 h-4" />
                      <span>Войти в урок</span>
                    </Button>
                  )}
                  
                  {lesson.status === 'confirmed' && !canJoinLesson(lesson.start_time, lesson.status) && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Доступно за 15 мин до урока</span>
                    </div>
                  )}
                  
                  {lesson.status === 'pending' && (
                    <div className="text-xs text-muted-foreground">
                      Ожидает подтверждения репетитора
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};