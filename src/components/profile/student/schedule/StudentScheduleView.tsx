import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Users, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format, startOfWeek, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface LessonItem {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  tutor_id: string;
  subject_id: string;
  subjects: { name: string } | null;
  tutor: { first_name: string; last_name: string } | null;
}

export const StudentScheduleView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      fetchLessons();
    }
  }, [user?.id, currentWeek]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);

      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          start_time,
          end_time,
          status,
          created_at,
          tutor_id,
          subject_id,
          subjects(name),
          tutor:profiles!tutor_id(first_name, last_name)
        `)
        .eq('student_id', user?.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      const transformedData: LessonItem[] = (data || []).map(item => ({
        ...item,
        subjects: Array.isArray(item.subjects) && item.subjects.length > 0 
          ? item.subjects[0] 
          : null,
        tutor: Array.isArray(item.tutor) && item.tutor.length > 0 
          ? item.tutor[0] 
          : null
      }));
      
      setLessons(transformedData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить расписание",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Запланировано</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Проведено</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Отменено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getLessonsForDay = (date: Date) => {
    return lessons.filter(lesson => {
      const lessonDate = new Date(lesson.start_time);
      return lessonDate.toDateString() === date.toDateString();
    });
  };

  const handleChatClick = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мое расписание</h1>
          <p className="text-gray-600">Занятия с репетиторами</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Расписание на неделю
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                ←
              </Button>
              <span className="text-sm font-medium">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: ru })} - {' '}
                {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'dd MMM yyyy', { locale: ru })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {getWeekDays().map((day, index) => {
                const dayLessons = getLessonsForDay(day);
                const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
                
                return (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="text-center mb-3">
                      <div className="font-medium text-sm">{dayNames[index]}</div>
                      <div className="text-lg font-semibold">{format(day, 'd', { locale: ru })}</div>
                    </div>
                    
                    <div className="space-y-2">
                      {dayLessons.length === 0 ? (
                        <div className="text-center text-gray-400 text-xs py-4">
                          Нет занятий
                        </div>
                      ) : (
                        dayLessons.map((lesson) => (
                          <div key={lesson.id} className="bg-gray-50 rounded p-2 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {format(new Date(lesson.start_time), 'HH:mm', { locale: ru })}
                              </span>
                              {getStatusBadge(lesson.status)}
                            </div>
                            {lesson.subjects && (
                              <div className="text-gray-600 mb-1">{lesson.subjects.name}</div>
                            )}
                            {lesson.tutor && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                  {lesson.tutor.first_name} {lesson.tutor.last_name}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleChatClick(lesson.tutor_id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ближайшие занятия
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Нет запланированных занятий</p>
              <p className="text-sm">Занятия появятся здесь после планирования с репетиторами</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.slice(0, 5).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {format(new Date(lesson.start_time), 'd', { locale: ru })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(lesson.start_time), 'MMM', { locale: ru })}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {format(new Date(lesson.start_time), 'HH:mm', { locale: ru })} - {' '}
                        {format(new Date(lesson.end_time), 'HH:mm', { locale: ru })}
                      </div>
                      {lesson.subjects && (
                        <div className="text-sm text-gray-600">{lesson.subjects.name}</div>
                      )}
                      {lesson.tutor && (
                        <div className="text-sm text-gray-500">
                          {lesson.tutor.first_name} {lesson.tutor.last_name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(lesson.status)}
                    {lesson.tutor && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChatClick(lesson.tutor_id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
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
