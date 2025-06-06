import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Calendar, MessageSquare, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

export const TutorRequestsTab: React.FC = () => {
  const { user } = useAuth();

  // Fetch lesson requests
  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['tutorRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          *,
          student:student_id (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subject_id (
            name
          )
        `)
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const handleRequestResponse = async (requestId: string, status: 'confirmed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({ 
          status,
          responded_at: new Date().toISOString(),
          tutor_response: status === 'confirmed' ? 'Принято' : 'Отклонено'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'confirmed' ? 'Запрос принят' : 'Запрос отклонен',
        description: 'Студент получит уведомление о вашем решении'
      });

      refetch();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать запрос',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  const pendingRequests = requests?.filter(req => req.status === 'pending') || [];
  const processedRequests = requests?.filter(req => req.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Запросы на занятия</h2>
        <Badge variant="secondary">
          {pendingRequests.length} новых
        </Badge>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Ожидают ответа ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.student?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {request.student?.first_name} {request.student?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.subject?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Ожидает
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(request.requested_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{request.requested_start_time} - {request.requested_end_time}</span>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Сообщение от студента:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRequestResponse(request.id, 'confirmed')}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Принять
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRequestResponse(request.id, 'rejected')}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История запросов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedRequests.slice(0, 10).map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={request.student?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">
                        {request.student?.first_name} {request.student?.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {request.subject?.name} • {new Date(request.requested_date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={request.status === 'confirmed' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {request.status === 'confirmed' ? 'Принят' : 'Отклонен'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет запросов</h3>
            <p className="text-muted-foreground">
              Когда студенты будут отправлять вам запросы на занятия, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
