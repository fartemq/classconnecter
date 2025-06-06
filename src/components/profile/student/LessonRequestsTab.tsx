import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, BookOpen, Calendar, MessageSquare, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { LessonRequestModal } from "./LessonRequestModal";
import { useToast } from "@/hooks/use-toast";
import { StudentTimeSlotPicker } from "./StudentTimeSlotPicker";
import { LessonRequest, TimeSlot } from "@/types/lessonRequest";

export const LessonRequestsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<{
    request: LessonRequest;
    timeSlots: TimeSlot[];
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
          tutor:profiles!lesson_requests_tutor_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          subject:subjects (
            name
          )
        `)
        .eq('student_id', user?.id)
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

  const handleSelectTime = (request: LessonRequest) => {
    if (request.tutor_response) {
      try {
        const timeSlots = JSON.parse(request.tutor_response);
        setSelectedRequest({ request, timeSlots });
      } catch (error) {
        console.error('Error parsing tutor response:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить предложенное время',
          variant: 'destructive'
        });
      }
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
        <h2 className="text-2xl font-bold">Мои запросы на занятия</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {requests.filter(r => r.status === 'time_slots_proposed').length} требуют ответа
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет запросов на занятия</h3>
            <p className="text-gray-500">
              Найдите репетитора и отправьте запрос на занятие
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
                    <AvatarImage src={request.tutor?.avatar_url || undefined} />
                    <AvatarFallback>
                      {request.tutor?.first_name?.[0]}{request.tutor?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.tutor?.first_name} {request.tutor?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Репетитор
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Предмет:</span>
                        <span className="ml-1">{request.subject?.name}</span>
                      </div>

                      {request.message && (
                        <div className="flex items-start text-sm">
                          <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <span className="font-medium">Ваше сообщение:</span>
                            <p className="mt-1 text-muted-foreground">{request.message}</p>
                          </div>
                        </div>
                      )}

                      {request.status === 'time_slots_proposed' && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800 mb-2">
                            Репетитор предложил варианты времени для занятий
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        Запрос отправлен {format(new Date(request.created_at), 'dd.MM.yyyy в HH:mm', { locale: ru })}
                      </div>

                      <div className="flex items-center gap-2">
                        {request.status === 'time_slots_proposed' && (
                          <Button
                            onClick={() => handleSelectTime(request)}
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-4 w-4" />
                            Выбрать время
                          </Button>
                        )}
                        
                        {request.status === 'confirmed' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Занятие подтверждено</span>
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="flex items-center gap-2 text-red-600">
                            <X className="h-4 w-4" />
                            <span className="text-sm font-medium">Запрос отклонен</span>
                          </div>
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

      {selectedRequest && (
        <StudentTimeSlotPicker
          isOpen={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            fetchLessonRequests();
          }}
          requestId={selectedRequest.request.id}
          tutorName={`${selectedRequest.request.tutor?.first_name} ${selectedRequest.request.tutor?.last_name}`}
          subject={selectedRequest.request.subject?.name || ''}
          timeSlots={selectedRequest.timeSlots}
        />
      )}
    </div>
  );
};
