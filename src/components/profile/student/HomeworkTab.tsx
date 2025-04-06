
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HomeworkTab = () => {
  // Mock data - would come from database in real app
  const currentHomework = [
    {
      id: 1,
      title: "Решение квадратных уравнений",
      subject: "Математика",
      dueDate: "10 апреля 2025",
      priority: "high",
      status: "in progress"
    }
  ];
  
  const completedHomework = [
    {
      id: 2,
      title: "Сочинение по литературе",
      subject: "Литература",
      completedDate: "2 апреля 2025",
      grade: "Отлично"
    }
  ];
  
  const renderHomeworkList = (homeworkList: any[], emptyMessage: string) => {
    if (homeworkList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {homeworkList.map((homework) => (
          <Card key={homework.id} className="overflow-hidden shadow-md gradient-card rounded-xl card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{homework.title}</h3>
                  <p className="text-gray-600 text-sm">{homework.subject}</p>
                </div>
                {homework.status === "in progress" ? (
                  <Badge className="bg-amber-500">В процессе</Badge>
                ) : (
                  <Badge className="bg-green-500">Завершено</Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mt-2">
                {homework.dueDate && (
                  <div className="flex items-center mr-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Срок сдачи: {homework.dueDate}</span>
                  </div>
                )}
                
                {homework.completedDate && (
                  <div className="flex items-center mr-4">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span>Сдано: {homework.completedDate}</span>
                  </div>
                )}
                
                {homework.grade && (
                  <div className="flex items-center mr-4 text-green-600 font-medium">
                    <span>Оценка: {homework.grade}</span>
                  </div>
                )}
                
                {homework.priority === "high" && (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Высокий приоритет</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Домашние задания</h2>
        <FileText size={22} className="text-gray-700" />
      </div>
      
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="mb-4 rounded-full p-1 w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="current" className="flex items-center justify-center rounded-full py-2 px-4">
            <Clock size={16} className="mr-2" />
            Текущие
            <Badge className="ml-2 bg-amber-500">{currentHomework.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center rounded-full py-2 px-4">
            <CheckCircle size={16} className="mr-2" />
            Выполненные
            <Badge className="ml-2 bg-green-500">{completedHomework.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          {renderHomeworkList(currentHomework, "У вас нет текущих домашних заданий.")}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderHomeworkList(completedHomework, "У вас нет выполненных домашних заданий.")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
