import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface LessonRequest {
  id: string;
  tutor_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message: string | null;
  status: string;
  tutor_response: string | null;
  created_at: string;
  tutor: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
}

export const StudentLessonRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['studentLessonRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          id,
          tutor_id,
          subject_id,
          requested_date,
          requested_start_time,
          requested_end_time,
          message,
          status,
          tutor_response,
          created_at,
          tutor:profiles!lesson_requests_tutor_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subjects (
            name
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tutor: Array.isArray(item.tutor) ? item.tutor[0] : item.tutor,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject
      })) as LessonRequest[];
    },
    enabled: !!user?.id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ожидает ответа</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Подтверждено</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Отменено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Запрос отменен",
        description: "Запрос на занятие успешно отменен"
      });

      refetch();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить запрос",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Мои запросы на занятия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requests.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Мои запросы на занятия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У вас нет активных запросов</p>
            <p className="text-sm">Найдите репетитора и забронируйте занятие</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои запросы на занятия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.tutor?.first_name} {request.tutor?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {request.subject?.name}
                    </span>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(request.requested_date), "d MMMM yyyy", { locale: ru })}
                  </span>
                  <span>
                    {request.requested_start_time.substring(0, 5)} - {request.requested_end_time.substring(0, 5)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Запрос отправлен: {format(new Date(request.created_at), "d MMM, HH:mm", { locale: ru })}
                </div>
              </div>

              {request.message && (
                <div className="mb-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ваше сообщение:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.message}</p>
                </div>
              )}

              {request.tutor_response && (
                <div className="mb-3 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Ответ репетитора:</span>
                  </div>
                  <p className="text-sm">{request.tutor_response}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Отменить запрос
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};