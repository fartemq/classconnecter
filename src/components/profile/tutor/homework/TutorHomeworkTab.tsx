
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, BookOpen, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { fetchHomeworkForTutor } from "@/services/homework/homeworkService";
import { useAuth } from "@/hooks/auth/useAuth";
import { Homework } from "@/types/homework";
import { HomeworkCard } from "@/components/homework/HomeworkCard";

export const TutorHomeworkTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadHomework = async () => {
      if (!user) return;
      
      try {
        const data = await fetchHomeworkForTutor(user.id);
        setHomework(data);
      } catch (error) {
        console.error('Error loading homework:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить домашние задания",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHomework();
  }, [user, toast]);

  const filteredHomework = homework.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hw.student?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hw.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || hw.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const assignedHomework = filteredHomework.filter(hw => hw.status === 'assigned');
  const submittedHomework = filteredHomework.filter(hw => hw.status === 'submitted');
  const gradedHomework = filteredHomework.filter(hw => hw.status === 'graded');

  const handleViewHomework = (homework: Homework) => {
    if (homework.status === 'submitted') {
      navigate(`/homework/grade/${homework.id}`);
    } else {
      navigate(`/homework/assignment/${homework.id}`);
    }
  };

  const handleGradeHomework = (homework: Homework) => {
    navigate(`/homework/grade/${homework.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Домашние задания</h2>
        <Button onClick={() => navigate('/homework/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по названию, студенту или предмету..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="assigned">Назначено</SelectItem>
            <SelectItem value="submitted">Отправлено</SelectItem>
            <SelectItem value="graded">Проверено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submitted">
            На проверке ({submittedHomework.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Назначенные ({assignedHomework.length})
          </TabsTrigger>
          <TabsTrigger value="graded">
            Проверенные ({gradedHomework.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submitted" className="space-y-4">
          {submittedHomework.length > 0 ? (
            submittedHomework.map((hw) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                viewMode="tutor"
                onView={handleViewHomework}
                onGrade={handleGradeHomework}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Нет работ на проверке</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          {assignedHomework.length > 0 ? (
            assignedHomework.map((hw) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                viewMode="tutor"
                onView={handleViewHomework}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Нет назначенных заданий</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {gradedHomework.length > 0 ? (
            gradedHomework.map((hw) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                viewMode="tutor"
                onView={handleViewHomework}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Нет проверенных работ</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
