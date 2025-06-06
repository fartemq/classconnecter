
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Calendar, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
        .eq('status', 'accepted')
        .order('start_date', { ascending: false });

      if (error) throw error;

      const formattedStudents = data?.map(item => ({
        id: item.student_id,
        first_name: Array.isArray(item.student) ? item.student[0]?.first_name : item.student?.first_name,
        last_name: Array.isArray(item.student) ? item.student[0]?.last_name : item.student?.last_name,
        avatar_url: Array.isArray(item.student) ? item.student[0]?.avatar_url : item.student?.avatar_url,
        city: Array.isArray(item.student) ? item.student[0]?.city : item.student?.city,
        relationship_start: item.start_date,
        relationship_status: item.status
      })).filter(student => student.first_name) || []; // Filter out invalid students

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
              onClick={() => navigate('/profile/tutor/requests')}
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
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {student.first_name} {student.last_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {student.city || "Город не указан"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Начали работать: {format(new Date(student.relationship_start), 'dd MMMM yyyy', { locale: ru })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChatWithStudent(student.id)}
                    className="flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Чат</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleScheduleWithStudent(student.id)}
                    className="flex items-center space-x-1"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Расписание</span>
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
