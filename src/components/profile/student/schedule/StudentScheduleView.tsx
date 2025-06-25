
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen, Video } from "lucide-react";
import { Lesson } from "@/types/lesson";
import { ensureSingleObject } from "@/utils/supabaseUtils";

export const StudentScheduleView = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchLessons();
    }
  }, [user?.id, selectedDate]);

  const fetchLessons = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          tutor_id,
          student_id,
          subject_id,
          start_time,
          end_time,
          status,
          created_at,
          updated_at,
          tutor:profiles!tutor_id (id, first_name, last_name, avatar_url),
          subject:subjects (id, name)
        `)
        .eq('student_id', user.id)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`)
        .order('start_time');

      if (error) throw error;

      const transformedLessons: Lesson[] = (data || []).map(item => {
        const tutor = ensureSingleObject(item.tutor);
        const subject = ensureSingleObject(item.subject);
        
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);
        const timeString = format(startTime, 'HH:mm:ss');
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        
        return {
          id: item.id,
          tutor_id: item.tutor_id,
          student_id: item.student_id,
          subject_id: item.subject_id,
          date: format(startTime, 'yyyy-MM-dd'),
          time: timeString,
          duration: durationMinutes,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          tutor: tutor ? {
            id: tutor.id,
            first_name: tutor.first_name,
            last_name: tutor.last_name,
            avatar_url: tutor.avatar_url
          } : undefined,
          subject: subject ? {
            id: subject.id,
            name: subject.name
          } : undefined
        };
      });

      setLessons(transformedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'secondary';
      case 'canceled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'Ожидает подтверждения';
      case 'completed': return 'Завершено';
      case 'canceled': return 'Отменено';
      default: return status;
    }
  };

  const upcomingLessons = lessons.filter(lesson => 
    new Date(lesson.date + 'T' + lesson.time) > new Date() && 
    ['confirmed', 'pending'].includes(lesson.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle className="text-lg">Календарь</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ru}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Занятия на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                </span>
                <Badge variant="outline">
                  {lessons.length} занятий
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет занятий на эту дату</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <Card key={lesson.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {lesson.time.substring(0, 5)} 
                                ({lesson.duration} мин)
                              </span>
                              <Badge variant={getStatusColor(lesson.status)}>
                                {getStatusText(lesson.status)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span>{lesson.subject?.name}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {lesson.tutor?.first_name} {lesson.tutor?.last_name}
                              </span>
                            </div>
                          </div>
                          
                          {lesson.status === 'confirmed' && (
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4 mr-2" />
                              Войти в урок
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {upcomingLessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ближайшие занятия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingLessons.slice(0, 3).map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{lesson.subject?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(lesson.date + 'T' + lesson.time), 'dd.MM в HH:mm', { locale: ru })}
                          {' с '}
                          {lesson.tutor?.first_name} {lesson.tutor?.last_name}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(lesson.status)}>
                        {getStatusText(lesson.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
