
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const HomeworkTab = () => {
  // Mock data - would come from database in real app
  const currentHomework = [];
  
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
          <Button className="mt-4">Создать новое задание</Button>
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
        <h2 className="text-xl font-bold text-green-600">Домашние задания</h2>
        <FileText size={22} className="text-green-600" />
      </div>
      
      {renderHomeworkList(currentHomework, "Нет активных домашних заданий для проверки")}
    </div>
  );
};
