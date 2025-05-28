
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Calendar, MessageSquare, Eye } from "lucide-react";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { useAuth } from "@/hooks/useAuth";
import { LessonRequest } from "@/types/lessonRequest";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { StudentProfileRequestDialog } from "../student/StudentProfileRequestDialog";

export const LessonRequestsTab = () => {
  const { user } = useAuth();
  const { lessonRequests, isLoading, updateLessonRequestStatus } = useLessonRequests(user?.id, 'tutor');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (requestId: string, status: 'confirmed' | 'rejected') => {
    setIsUpdating(true);
    const success = await updateLessonRequestStatus(requestId, status);
    if (success) {
      setSelectedStudentId(null);
      setSelectedRequestId(null);
    }
    setIsUpdating(false);
  };

  const handleViewProfile = (studentId: string, requestId: string) => {
    setSelectedStudentId(studentId);
    setSelectedRequestId(requestId);
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  const pendingRequests = lessonRequests.filter(req => req.status === 'pending');
  const otherRequests = lessonRequests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Запросы на занятия</h2>
        
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">
              Ожидают ответа ({pendingRequests.length})
            </h3>
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar>
                          <AvatarImage src={request.student?.avatar_url || ""} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {request.student?.first_name} {request.student?.last_name}
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
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(request.student_id, request.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Профиль
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {otherRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">История запросов</h3>
            <div className="grid gap-4">
              {otherRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={request.student?.avatar_url || ""} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">
                              {request.student?.first_name} {request.student?.last_name}
                            </h4>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{request.subject?.name}</span>
                            <span>{format(new Date(request.requested_date), 'd MMM', { locale: ru })}</span>
                            <span>{request.requested_start_time}</span>
                          </div>
                          
                          {request.tutor_response && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Ваш ответ: {request.tutor_response}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lessonRequests.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет запросов на занятия</h3>
              <p className="text-gray-500">
                Когда студенты отправят вам запросы на занятия, они появятся здесь
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedStudentId && selectedRequestId && (
        <StudentProfileRequestDialog
          isOpen={!!selectedStudentId}
          onClose={() => {
            setSelectedStudentId(null);
            setSelectedRequestId(null);
          }}
          studentId={selectedStudentId}
          requestId={selectedRequestId}
          onAccept={(requestId) => handleStatusUpdate(requestId, 'confirmed')}
          onReject={(requestId) => handleStatusUpdate(requestId, 'rejected')}
        />
      )}
    </div>
  );
};
