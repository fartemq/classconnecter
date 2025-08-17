import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export const StudentLessonRequests = () => {
  const { user } = useSimpleAuth();
  const { requests, loading } = useLessonRequests(user?.id, 'student');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Ожидает ответа</Badge>;
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

  if (loading) {
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
            <p>У вас пока нет запросов на занятия</p>
            <p className="text-sm">Найдите репетитора и забронируйте первое занятие</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="bg-yellow-50/50">
            <CardTitle className="text-yellow-800">
              Ожидают ответа ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {pendingRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.tutor?.avatar_url || ""} />
                      <AvatarFallback>
                        {request.tutor?.first_name?.[0]}{request.tutor?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request.tutor?.first_name} {request.tutor?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{request.subject?.name}</span>
                      </div>
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
                    Отправлен: {format(new Date(request.created_at), "d MMM, HH:mm", { locale: ru })}
                  </div>
                </div>

                {request.message && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Ваше сообщение:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                )}
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
            {processedRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.tutor?.avatar_url || ""} />
                      <AvatarFallback>
                        {request.tutor?.first_name?.[0]}{request.tutor?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request.tutor?.first_name} {request.tutor?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>{request.subject?.name}</span>
                      </div>
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
                  {request.responded_at && (
                    <div className="text-sm text-muted-foreground">
                      Ответ получен: {format(new Date(request.responded_at), "d MMM, HH:mm", { locale: ru })}
                    </div>
                  )}
                </div>

                {request.tutor_response && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Ответ репетитора:</span>
                    </div>
                    <p className="text-sm">{request.tutor_response}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};