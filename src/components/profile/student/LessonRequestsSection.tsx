
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Calendar, MessageSquare } from "lucide-react";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const LessonRequestsSection = () => {
  const { user } = useAuth();
  const { requests, loading } = useLessonRequests(user?.id, 'student');

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default",
      confirmed: "default",
      rejected: "destructive",
      completed: "secondary",
      cancelled: "outline"
    } as const;

    const labels = {
      pending: "Ожидает ответа",
      confirmed: "Подтверждено",
      rejected: "Отклонено",
      completed: "Завершено",
      cancelled: "Отменено"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Мои запросы на занятия
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запросов</h3>
            <p className="text-gray-500">
              Когда вы отправите запросы на занятия репетиторам, они появятся здесь
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={request.tutor?.avatar_url || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {request.tutor?.first_name} {request.tutor?.last_name}
                      </h4>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {request.subject?.name || 'Предмет не указан'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(request.requested_date), 'd MMMM yyyy', { locale: ru })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {request.requested_start_time} - {request.requested_end_time}
                      </div>
                    </div>
                    
                    {request.message && (
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 mr-1 mt-0.5 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>
                    )}
                    
                    {request.tutor_response && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Ответ репетитора:</strong> {request.tutor_response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
