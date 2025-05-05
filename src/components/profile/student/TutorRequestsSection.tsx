
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCheck, UserMinus, MessageSquare, Clock, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string | null;
  created_at: string;
  updated_at: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export const TutorRequestsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorRequests, setTutorRequests] = useState<TutorRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  useEffect(() => {
    if (user) {
      fetchTutorRequests();
    }
  }, [user, activeTab]);
  
  const fetchTutorRequests = async () => {
    try {
      setIsLoading(true);
      
      const statusFilter = activeTab === 'all' 
        ? ['pending', 'accepted', 'rejected', 'completed'] 
        : [activeTab];
      
      const { data, error } = await supabase
        .from('student_requests')
        .select(`
          *,
          tutor:profiles!tutor_id(id, first_name, last_name, avatar_url, role, city),
          subject:subject_id(id, name)
        `)
        .eq('student_id', user?.id)
        .in('status', statusFilter);
      
      if (error) {
        console.error('Error fetching tutor requests:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список запросов от репетиторов",
          variant: "destructive"
        });
        return;
      }
      
      setTutorRequests(data as TutorRequest[] || []);
    } catch (err) {
      console.error('Exception fetching tutor requests:', err);
      toast({
        title: "Ошибка загрузки",
        description: "Произошла ошибка при загрузке данных",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected' | 'completed') => {
    try {
      const { error } = await supabase
        .from('student_requests')
        .update({ status: newStatus })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error updating request status:', error);
        toast({
          title: "Ошибка обновления статуса",
          description: "Не удалось обновить статус запроса",
          variant: "destructive"
        });
        return;
      }
      
      // Refresh the list
      fetchTutorRequests();
      
      toast({
        title: "Статус обновлен",
        description: `Запрос успешно ${
          newStatus === 'accepted' ? 'принят' : 
          newStatus === 'rejected' ? 'отклонен' : 'завершен'
        }`,
      });
    } catch (err) {
      console.error('Exception updating request status:', err);
      toast({
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении статуса",
        variant: "destructive"
      });
    }
  };
  
  const getStatusCount = (status: string) => {
    return tutorRequests.filter(req => 
      status === 'all' ? true : req.status === status
    ).length;
  };
  
  const contactTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };
  
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Запросы от репетиторов</h2>
        <Filter size={20} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="relative">
            Все
            <Badge className="ml-1 text-xs">{getStatusCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Ожидающие
            <Badge variant="secondary" className="ml-1 text-xs bg-yellow-100">{getStatusCount('pending')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="relative">
            Принятые
            <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{getStatusCount('accepted')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Отклоненные
            <Badge variant="secondary" className="ml-1 text-xs bg-red-100">{getStatusCount('rejected')}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {tutorRequests.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="text-center py-10">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Нет запросов</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === "all" 
                    ? "У вас пока нет запросов от репетиторов." 
                    : `У вас нет ${
                      activeTab === "pending" ? "ожидающих" : 
                      activeTab === "accepted" ? "принятых" : 
                      "отклоненных"
                    } запросов.`}
                </p>
                <Button onClick={() => navigate("/tutors")}>
                  Найти репетиторов
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        {request.tutor.avatar_url ? (
                          <AvatarImage src={request.tutor.avatar_url} alt={request.tutor.first_name} />
                        ) : (
                          <AvatarFallback>{request.tutor.first_name[0]}</AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{`${request.tutor.first_name} ${request.tutor.last_name || ''}`}</h3>
                            <div className="text-sm text-gray-500 mb-1">
                              {request.tutor.city || "Город не указан"}
                            </div>
                          </div>
                          
                          <div>
                            {request.status === 'pending' && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Ожидает
                              </Badge>
                            )}
                            {request.status === 'accepted' && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Принят
                              </Badge>
                            )}
                            {request.status === 'rejected' && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Отклонен
                              </Badge>
                            )}
                            {request.status === 'completed' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Завершен
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm mt-2">
                          <div className="font-medium">Предмет: {request.subject?.name || "Не указан"}</div>
                          {request.message && (
                            <div className="mt-2 text-gray-700 bg-gray-50 p-2 rounded">
                              {request.message}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Запрос от {new Date(request.created_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2 border-t">
                    {request.status === 'pending' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-700"
                          onClick={() => updateRequestStatus(request.id, 'accepted')}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Принять
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-700"
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/tutors/${request.tutor_id}`)}
                        >
                          Профиль
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => contactTutor(request.tutor_id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Связаться
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
