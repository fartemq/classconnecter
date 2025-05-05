
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle, Search, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Homework {
  id: number;
  title: string;
  subject: string;
  dueDate?: string;
  completedDate?: string;
  grade?: string;
  status: 'pending' | 'in progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  attachments?: number;
  tutorName: string;
  tutorAvatar?: string;
}

export const HomeworkTab = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - would come from database in real app
  const allHomework: Homework[] = [
    {
      id: 1,
      title: "Решение задач по алгебре",
      subject: "Математика",
      dueDate: "10 мая 2025",
      status: "in progress",
      priority: "high",
      attachments: 2,
      tutorName: "Иванов Иван",
      tutorAvatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      title: "Сочинение по литературе",
      subject: "Литература",
      completedDate: "2 апреля 2025",
      grade: "Отлично",
      status: "completed",
      tutorName: "Петрова Анна",
      tutorAvatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      title: "Лабораторная работа по химии",
      subject: "Химия",
      completedDate: "15 марта 2025",
      grade: "Хорошо",
      status: "completed",
      tutorName: "Сидоров Алексей"
    },
    {
      id: 4,
      title: "Упражнения по грамматике",
      subject: "Английский язык",
      dueDate: "15 мая 2025",
      status: "in progress",
      priority: "medium",
      attachments: 1,
      tutorName: "Смирнова Ольга",
      tutorAvatar: "https://i.pravatar.cc/150?img=5"
    }
  ];
  
  const currentHomework = allHomework.filter(hw => hw.status !== 'completed');
  const completedHomework = allHomework.filter(hw => hw.status === 'completed');
  
  // Filter homework based on search term
  const filteredCurrentHomework = currentHomework.filter(hw => 
    hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCompletedHomework = completedHomework.filter(hw => 
    hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderHomeworkList = (homeworkList: Homework[]) => {
    if (homeworkList.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500 mb-2">
            {activeTab === "current" 
              ? "У вас нет активных домашних заданий" 
              : "У вас нет выполненных домашних заданий"}
          </p>
          <Button className="mt-2" size="sm">
            <Plus size={16} className="mr-1.5" />
            Создать новое задание
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {homeworkList.map((homework) => (
          <Card key={homework.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{homework.title}</h3>
                    {homework.status === "in progress" ? (
                      <Badge className="bg-amber-500">В процессе</Badge>
                    ) : homework.status === "pending" ? (
                      <Badge className="bg-blue-500">Ожидает</Badge>
                    ) : (
                      <Badge className="bg-green-500">Завершено</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{homework.subject}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center text-xs text-gray-500 mt-3 gap-y-1">
                {homework.dueDate && (
                  <div className="flex items-center mr-3">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Срок сдачи: {homework.dueDate}</span>
                  </div>
                )}
                
                {homework.completedDate && (
                  <div className="flex items-center mr-3">
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                    <span>Сдано: {homework.completedDate}</span>
                  </div>
                )}
                
                {homework.grade && (
                  <div className="flex items-center mr-3 text-green-600 font-medium">
                    <span>Оценка: {homework.grade}</span>
                  </div>
                )}
                
                {homework.priority === "high" && (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Высокий приоритет</span>
                  </div>
                )}
                
                {homework.attachments && (
                  <div className="flex items-center ml-auto">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    <span>Файлов: {homework.attachments}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mt-3 pt-3 border-t">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                    {homework.tutorAvatar ? (
                      <img 
                        src={homework.tutorAvatar} 
                        alt={homework.tutorName}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-xs">{homework.tutorName.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{homework.tutorName}</span>
                </div>
                
                <div className="ml-auto">
                  <Button size="sm" variant="outline">
                    Открыть
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-green-600">Домашние задания</h2>
        <FileText size={24} className="text-green-600" />
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Поиск по заданиям..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>По дате сдачи</DropdownMenuItem>
              <DropdownMenuItem>По приоритету</DropdownMenuItem>
              <DropdownMenuItem>По предмету</DropdownMenuItem>
              <DropdownMenuItem>По репетитору</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button>
            <Plus size={16} className="mr-2" />
            Новое задание
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current" className="relative">
            Текущие
            {currentHomework.length > 0 && (
              <Badge className="ml-1.5 bg-amber-500">{currentHomework.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Выполненные
            {completedHomework.length > 0 && (
              <Badge className="ml-1.5 bg-green-500">{completedHomework.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-0">
          {renderHomeworkList(filteredCurrentHomework)}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {renderHomeworkList(filteredCompletedHomework)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
