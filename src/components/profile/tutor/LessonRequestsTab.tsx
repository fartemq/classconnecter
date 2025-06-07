
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/useAuth";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, Book, MessageSquare, Check, X } from "lucide-react";

export const LessonRequestsTab = () => {
  const { user } = useAuth();
  const { requests, loading, respondToRequest } = useLessonRequests(user?.id, 'tutor');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    const success = await respondToRequest(requestId, action, response);
    if (success) {
      setRespondingTo(null);
      setResponse("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтвержден';
      case 'pending': return 'Ожидает ответа';
      case 'rejected': return 'Отклонен';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Запросы на занятия</CardTitle>
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
        <CardTitle>Запросы на занятия</CardTitle>
        <p className="text-sm text-gray-600">
          Здесь отображаются запросы студентов на проведение занятий
        </p>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>Нет запросов на занятия</p>
            <p className="text-sm">Запросы от студентов появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {request.student?.first_name} {request.student?.last_name}
                        </span>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(request.requested_date), 'dd MMMM yyyy', { locale: ru })} в {request.requested_start_time.substring(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Book className="h-4 w-4" />
                          <span>{request.subject?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}
                  </div>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(request.id, 'accept')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Принять
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRespondingTo(respondingTo === request.id ? null : request.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Отклонить
                    </Button>
                  </div>
                )}

                {respondingTo === request.id && (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      placeholder="Причина отклонения (необязательно)"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRespond(request.id, 'reject')}
                      >
                        Отклонить запрос
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponse("");
                        }}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
