import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Calendar, MessageSquare, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";

interface LessonRequest {
  id: string;
  student_id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  student: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  subject: {
    name: string;
  };
}

export const LessonRequestsTab = () => {
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchLessonRequests();
    }
  }, [user?.id]);

  const fetchLessonRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          student_id,
          subject_id,
          start_time,
          end_time,
          status,
          created_at,
          student:profiles!student_id (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subjects (
            name
          )
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data?.map(item => ({
        id: item.id,
        student_id: item.student_id,
        subject_id: item.subject_id,
        start_time: item.start_time,
        end_time: item.end_time,
        status: item.status,
        created_at: item.created_at,
        student: Array.isArray(item.student) ? item.student[0] : item.student,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject,
      })) || [];

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching lesson requests:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить запросы на занятия",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResponse = async (requestId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // Remove from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));

      toast({
        title: action === 'confirmed' ? "Занятие подтверждено" : "Запрос отклонен",
        description: action === 'confirmed' 
          ? "Студент автоматически добавлен в ваш список учеников" 
          : "Студент получит уведомление об отклонении",
      });

      // Если запрос подтвержден, обновляем счетчики
      if (action === 'confirmed') {
        // Trigger to update students list will be handled by database trigger
        console.log('Request confirmed, student-tutor relationship will be created automatically');
      }
    } catch (error) {
      console.error('Error updating lesson request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус запроса",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Запросы на занятия</h1>
        <p className="text-gray-600">Управляйте запросами от студентов</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет новых запросов</h3>
            <p className="text-gray-500">
              Когда студенты отправят запросы на занятия, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-l-4 border-l-orange-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.student?.avatar_url} />
                      <AvatarFallback>
                        {request.student?.first_name?.[0] || '?'}
                        {request.student?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {request.student?.first_name} {request.student?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Запрос от {format(new Date(request.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                    <Clock className="h-3 w-3 mr-1" />
                    Ожидает ответа
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      <strong>Предмет:</strong> {request.subject?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      <strong>Дата:</strong> {format(new Date(request.start_time), 'dd MMMM yyyy', { locale: ru })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      <strong>Время:</strong> {format(new Date(request.start_time), 'HH:mm')} - {format(new Date(request.end_time), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Внимание:</strong> При подтверждении этого запроса студент автоматически будет добавлен в ваш список учеников, 
                    и вы сможете общаться с ним через чат и планировать дальнейшие занятия.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleRequestResponse(request.id, 'cancelled')}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Отклонить
                  </Button>
                  <Button
                    onClick={() => handleRequestResponse(request.id, 'confirmed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Подтвердить и добавить ученика
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
