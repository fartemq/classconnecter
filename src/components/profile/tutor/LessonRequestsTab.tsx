
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MessageSquare, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { StudentProfileRequestDialog } from "../student/StudentProfileRequestDialog";
import { TutorTimeSlotSelector } from "./TutorTimeSlotSelector";

interface LessonRequest {
  id: string;
  student_id: string;
  subject_id: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  message?: string;
  status: string;
  created_at: string;
  tutor_response?: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    city?: string;
  };
  subjects: {
    name: string;
  };
}

export const LessonRequestsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [timeSlotSelectorData, setTimeSlotSelectorData] = useState<{
    requestId: string;
    studentName: string;
    subject: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchLessonRequests();
    }
  }, [user?.id]);

  const fetchLessonRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          *,
          profiles!lesson_requests_student_id_fkey (
            first_name,
            last_name,
            avatar_url,
            city
          ),
          subjects (
            name
          )
        `)
        .eq('tutor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching lesson requests:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить запросы на занятия',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeTime = (request: LessonRequest) => {
    setTimeSlotSelectorData({
      requestId: request.id,
      studentName: `${request.profiles.first_name} ${request.profiles.last_name}`,
      subject: request.subjects.name
    });
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          tutor_response: 'Запрос отклонен'
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Запрос отклонен',
        description: 'Студент получил уведомление об отклонении'
      });

      fetchLessonRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить запрос',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Ожидает ответа</Badge>;
      case 'time_slots_proposed':
        return <Badge variant="default" className="bg-blue-600">Время предложено</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-600">Подтвержден</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонен</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Отменен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Запросы на занятия</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {requests.filter(r => r.status === 'pending').length} новых
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет запросов на занятия</h3>
            <p className="text-gray-500">
              Когда студенты отправят вам запросы на занятия, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.profiles.avatar_url} />
                    <AvatarFallback>
                      {request.profiles.first_name[0]}{request.profiles.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.profiles.first_name} {request.profiles.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {request.profiles.city}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Предмет:</span>
                        <span className="ml-1">{request.subjects.name}</span>
                      </div>

                      {request.message && (
                        <div className="flex items-start text-sm">
                          <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="font-medium">Сообщение:</span>
                            <p className="mt-1 text-muted-foreground">{request.message}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        Запрос отправлен {format(new Date(request.created_at), 'dd.MM.yyyy в HH:mm', { locale: ru })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudentId(request.student_id);
                            setSelectedRequestId(request.id);
                          }}
                          className="flex items-center gap-1"
                        >
                          <User className="h-4 w-4" />
                          Профиль студента
                        </Button>

                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Отклонить
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleProposeTime(request)}
                              className="flex items-center gap-1"
                            >
                              <Clock className="h-4 w-4" />
                              Предложить время
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStudentId && selectedRequestId && (
        <StudentProfileRequestDialog
          isOpen={!!selectedStudentId}
          onClose={() => {
            setSelectedStudentId(null);
            setSelectedRequestId(null);
          }}
          studentId={selectedStudentId}
          requestId={selectedRequestId}
          onAccept={() => {}}
          onReject={() => {}}
        />
      )}

      {timeSlotSelectorData && (
        <TutorTimeSlotSelector
          isOpen={!!timeSlotSelectorData}
          onClose={() => {
            setTimeSlotSelectorData(null);
            fetchLessonRequests();
          }}
          requestId={timeSlotSelectorData.requestId}
          studentName={timeSlotSelectorData.studentName}
          subject={timeSlotSelectorData.subject}
        />
      )}
    </div>
  );
};
