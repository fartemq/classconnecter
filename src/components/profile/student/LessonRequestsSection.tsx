
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, Eye, Calendar, User } from "lucide-react";

export const LessonRequestsSection = () => {
  const { user } = useAuth();
  const { requests, loading } = useLessonRequests(user?.id, 'student');
  const [filter, setFilter] = useState<string>('all');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Отправлена',
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'viewed':
        return {
          label: 'Просмотрена',
          icon: Eye,
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'confirmed':
        return {
          label: 'Принята',
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'rejected':
        return {
          label: 'Отклонена',
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getRequestCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      viewed: requests.filter(r => r.status === 'viewed').length,
      confirmed: requests.filter(r => r.status === 'confirmed').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const counts = getRequestCounts();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Мои запросы на занятия</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои запросы на занятия</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Все ({counts.all})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Отправлены ({counts.pending})
          </Button>
          <Button
            variant={filter === 'viewed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('viewed')}
          >
            Просмотрены ({counts.viewed})
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('confirmed')}
          >
            Приняты ({counts.confirmed})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('rejected')}
          >
            Отклонены ({counts.rejected})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Нет запросов с выбранным статусом</p>
            <p className="text-sm">Отправьте запросы репетиторам через поиск</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const statusInfo = getStatusInfo(request.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.tutor?.avatar_url} />
                        <AvatarFallback>
                          {request.tutor?.first_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {request.tutor?.first_name} {request.tutor?.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {request.subject?.name}
                        </div>
                      </div>
                    </div>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {format(new Date(request.requested_date), 'dd MMMM yyyy', { locale: ru })} в {request.requested_start_time.substring(0, 5)}
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                      <strong>Сообщение:</strong> {request.message}
                    </div>
                  )}

                  {request.tutor_response && (
                    <div className="bg-blue-50 rounded p-3 mb-3 text-sm">
                      <strong>Ответ репетитора:</strong> {request.tutor_response}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Отправлено: {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}
                    {request.responded_at && (
                      <span className="ml-4">
                        Ответ: {format(new Date(request.responded_at), 'dd.MM.yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
