
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
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-base font-medium text-gray-500">{emptyMessage}</p>
          <Button className="mt-3" size="sm">Создать новое задание</Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {homeworkList.map((homework) => (
          <Card key={homework.id} className="overflow-hidden shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-sm">{homework.title}</h3>
                  <p className="text-gray-600 text-xs">{homework.subject}</p>
                </div>
                {homework.status === "in progress" ? (
                  <Badge className="bg-amber-500">В процессе</Badge>
                ) : (
                  <Badge className="bg-green-500">Завершено</Badge>
                )}
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-2">
                {homework.dueDate && (
                  <div className="flex items-center mr-3">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Срок сдачи: {homework.dueDate}</span>
                  </div>
                )}
                
                {homework.completedDate && (
                  <div className="flex items-center mr-3">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
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
                    <AlertCircle className="h-3 w-3 mr-1" />
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-green-600">Домашние задания</h2>
        <FileText size={20} className="text-green-600" />
      </div>
      
      {renderHomeworkList(currentHomework, "Нет активных домашних заданий для проверки")}
    </div>
  );
};
