
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Clock, User, MessageSquare } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { getTutorStudentRequests, updateRequestStatus, StudentRequest } from "@/services/studentRequestService";

export const NewTutorRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const data = await getTutorStudentRequests();
    setRequests(data);
    setIsLoading(false);
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    const success = await updateRequestStatus(requestId, status, true);
    if (success) {
      fetchRequests(); // Refresh the list
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Запросы от студентов</h2>
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
                      <AvatarImage src={request.tutor?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {request.tutor?.first_name} {request.tutor?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.tutor?.city || "Город не указан"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Ожидает
                  </Badge>
                </div>

                {request.subject && (
                  <div className="text-sm">
                    <strong>Предмет:</strong> {request.subject.name}
                  </div>
                )}

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Сообщение от студента:</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Получено: {format(new Date(request.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleRequestResponse(request.id, 'accepted')}
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
                      <AvatarImage src={request.tutor?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">
                        {request.tutor?.first_name} {request.tutor?.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {request.subject?.name} • {format(new Date(request.created_at), 'dd.MM.yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={request.status === 'accepted' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {request.status === 'accepted' ? 'Принят' : 'Отклонен'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет запросов</h3>
            <p className="text-muted-foreground">
              Когда студенты будут отправлять вам запросы на обучение, они появятся здесь
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
