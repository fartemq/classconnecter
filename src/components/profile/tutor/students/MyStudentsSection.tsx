
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Users, AlertCircle, UserCheck, UserMinus, Clock, CheckCircle, 
  XCircle, MessageSquare, BookOpen 
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { StudentContactDialog } from "./StudentContactDialog";
import { Badge } from "@/components/ui/badge";
import { Student } from "./mockData";
import { Loader } from "@/components/ui/loader";

type StudentRequest = {
  id: string;
  tutor_id: string;
  student_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  subject_id: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
  student?: {
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
};

export const MyStudentsSection = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentRequests();
    }
  }, [user, activeTab]);

  const fetchStudentRequests = async () => {
    try {
      setIsLoading(true);
      
      const statusFilter = activeTab === 'all' 
        ? ['pending', 'accepted', 'rejected', 'completed'] 
        : [activeTab];
      
      const { data, error } = await supabase
        .from('student_requests')
        .select(`
          *,
          student:profiles!student_id(id, first_name, last_name, avatar_url, role, city),
          subject:subject_id(id, name)
        `)
        .eq('tutor_id', user?.id)
        .in('status', statusFilter);
      
      if (error) {
        console.error('Error fetching student requests:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список учеников",
          variant: "destructive"
        });
        return;
      }
      
      setStudentRequests(data as StudentRequest[] || []);
    } catch (err) {
      console.error('Exception fetching student requests:', err);
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
      fetchStudentRequests();
      
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

  const handleContactStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  // Helper to get counts for status badges
  const getStatusCount = (status: string) => {
    return studentRequests.filter(req => 
      status === 'all' ? true : req.status === status
    ).length;
  };

  // Convert StudentRequest to Student type for contact dialog
  const createStudentFromRequest = (request: StudentRequest): Student => {
    return {
      id: request.student_id,
      name: `${request.student?.first_name || ''} ${request.student?.last_name || ''}`.trim(),
      status: request.status,
      level: 'N/A', // We don't have this info in the current DB schema
      grade: null,
      subjects: request.subject ? [request.subject.name] : [],
      city: request.student?.city || 'N/A',
      lastActive: new Date(request.updated_at).toLocaleDateString('ru-RU'),
      avatar: null,
      about: '',
      interests: []
    };
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (studentRequests.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Нет учеников</h3>
          <p className="text-gray-500 mb-4">
            У вас пока нет учеников. Добавьте новых учеников через раздел "Поиск учеников".
          </p>
          <Button onClick={() => setActiveTab("pending")}>
            <Clock className="mr-2 h-4 w-4" />
            Проверить запросы
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
            Активные
            <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{getStatusCount('accepted')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Отклоненные
            <Badge variant="secondary" className="ml-1 text-xs bg-red-100">{getStatusCount('rejected')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Завершенные
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">{getStatusCount('completed')}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ученик</TableHead>
                    <TableHead>Предмет</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.student?.first_name} {request.student?.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                          {request.subject?.name || 'Не указан'}
                        </div>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-green-700"
                                onClick={() => updateRequestStatus(request.id, 'accepted')}
                              >
                                <UserCheck className="h-4 w-4" />
                                <span className="sr-only">Принять</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-red-700"
                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                              >
                                <UserMinus className="h-4 w-4" />
                                <span className="sr-only">Отклонить</span>
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'accepted' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Завершить</span>
                              </Button>
                              <Button 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={() => handleContactStudent(createStudentFromRequest(request))}
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">Связаться</span>
                              </Button>
                            </>
                          )}
                          
                          {(request.status === 'rejected' || request.status === 'completed') && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-4"
                              onClick={() => handleContactStudent(createStudentFromRequest(request))}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Связаться
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Dialog */}
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent} 
          open={showContactDialog} 
          onClose={() => setShowContactDialog(false)} 
        />
      )}
    </div>
  );
};
