import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen, MessageSquare, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface LessonRequest {
  id: string;
  student_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message: string | null;
  status: string;
  created_at: string;
  student: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  subject: {
    name: string;
  } | null;
}

export const TutorLessonRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: requests = [], isLoading } = useQuery({
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
          message,
          status,
          created_at,
          student:profiles!lesson_requests_student_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subjects (
            name
          )
        `)
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        student: Array.isArray(item.student) ? item.student[0] : item.student,
        subject: Array.isArray(item.subject) ? item.subject[0] : item.subject
      })) as LessonRequest[];
    },
    enabled: !!user?.id
  });

  const respondMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      response 
    }: { 
      requestId: string; 
      status: 'confirmed' | 'rejected'; 
      response?: string;
    }) => {
      const updateData: any = {
        status,
        responded_at: new Date().toISOString(),
        tutor_response: response || null
      };

      const { error } = await supabase
        .from('lesson_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // If confirmed, create a lesson
      if (status === 'confirmed') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: lessonError } = await supabase
            .from('lessons')
            .insert({
              tutor_id: user?.id,
              student_id: request.student_id,
              subject_id: request.subject_id,
              start_time: `${request.requested_date}T${request.requested_start_time}`,
              end_time: `${request.requested_date}T${request.requested_end_time}`,
              status: 'confirmed'
            });

          if (lessonError) throw lessonError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tutorLessonRequests'] });
      toast({
        title: variables.status === 'confirmed' ? "Запрос подтвержден" : "Запрос отклонен",
        description: variables.status === 'confirmed' 
          ? "Урок добавлен в расписание" 
          : "Студент будет уведомлен об отклонении"
      });
      setResponses(prev => ({ ...prev, [variables.requestId]: '' }));
    },
    onError: (error) => {
      console.error('Error responding to request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать запрос",
        variant: "destructive"
      });
    }
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

  const handleConfirm = (requestId: string) => {
    respondMutation.mutate({
      requestId,
      status: 'confirmed',
      response: responses[requestId]
    });
  };

  const handleReject = (requestId: string) => {
    respondMutation.mutate({
      requestId,
      status: 'rejected',
      response: responses[requestId]
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Запросы на занятия</CardTitle>
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
          <CardTitle>Запросы на занятия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>У вас нет новых запросов</p>
            <p className="text-sm">Студенты смогут записываться к вам на занятия</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Запросы на занятия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {requests.map(request => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.student?.first_name} {request.student?.last_name}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  Получен: {format(new Date(request.created_at), "d MMM, HH:mm", { locale: ru })}
                </div>
              </div>

              {request.message && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Сообщение студента:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.message}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`response-${request.id}`}>
                      Ответ студенту (необязательно)
                    </Label>
                    <Textarea
                      id={`response-${request.id}`}
                      placeholder="Напишите сообщение студенту..."
                      value={responses[request.id] || ''}
                      onChange={(e) => setResponses(prev => ({
                        ...prev,
                        [request.id]: e.target.value
                      }))}
                      rows={2}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="outline"
                      disabled={respondMutation.isPending}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отклонить
                    </Button>
                    <Button
                      onClick={() => handleConfirm(request.id)}
                      disabled={respondMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Подтвердить
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};