import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Calendar, User, BookOpen, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { LessonAccessButton } from "@/components/lesson/LessonAccessButton";

interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  relationship_start: string;
  relationship_status: string;
}

export const StudentsTab = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchStudents();
    }
  }, [user?.id]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          student_id,
          start_date,
          status,
          student:profiles!student_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city
          )
        `)
        .eq('tutor_id', user?.id)
        .in('status', ['pending', 'accepted']) // Включаем и pending и accepted
        .order('start_date', { ascending: false });

      if (error) throw error;

      const formattedStudents = data?.map(item => {
        const studentData = Array.isArray(item.student) 
          ? item.student[0] 
          : item.student;
        
        return {
          id: item.student_id,
          first_name: studentData?.first_name || '',
          last_name: studentData?.last_name || null,
          avatar_url: studentData?.avatar_url || null,
          city: studentData?.city || null,
          relationship_start: item.start_date,
          relationship_status: item.status
        };
      }).filter(student => student.first_name) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithStudent = (studentId: string) => {
    navigate(`/profile/tutor/chats/${studentId}`);
  };

  const handleScheduleWithStudent = (studentId: string) => {
    navigate(`/profile/tutor/schedule?studentId=${studentId}`);
  };

  const handleLessonWithStudent = (studentId: string) => {
    // Navigate to lesson interface with partner parameters
    navigate(`/lesson?partnerId=${studentId}&role=tutor`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Мои ученики</h2>
          <p className="text-muted-foreground">
            Ученики, с которыми вы работаете
          </p>
        </div>
        <Badge variant="secondary">
          {students.length} учеников
        </Badge>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет учеников</h3>
            <p className="text-gray-500 mb-4">
              Когда студенты отправят вам запросы и вы их примете, они появятся здесь
            </p>
            <Button 
              onClick={() => navigate('/profile/tutor/lesson-requests')}
              variant="outline"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Посмотреть запросы
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar_url || undefined} />
                    <AvatarFallback>
                      {student.first_name?.[0]?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">
                        {student.first_name} {student.last_name}
                      </h3>
                      <Badge variant={student.relationship_status === 'accepted' ? 'default' : 'secondary'}>
                        {student.relationship_status === 'accepted' ? 'Принят' : 'Ожидает'}
                      </Badge>
                    </div>
                    {student.city && (
                      <p className="text-sm text-muted-foreground">{student.city}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      С {format(new Date(student.relationship_start), 'd MMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChatWithStudent(student.id)}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Чат
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleWithStudent(student.id)}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Расписание
                    </Button>
                  </div>
                  
                  {/* Кнопка урока - теперь работает с правильным маршрутом */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleLessonWithStudent(student.id)}
                    className="w-full"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Урок
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
