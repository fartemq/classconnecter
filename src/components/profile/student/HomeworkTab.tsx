
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const HomeworkTab = () => {
  // Mock data - would come from database in real app
  const currentHomework = [];
  const completedHomework = [];
  
  const renderHomeworkList = (homeworkList: any[], emptyMessage: string) => {
    if (homeworkList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {/* Map through homework list here */}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Домашние задания</CardTitle>
          <FileText size={20} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current" className="flex items-center">
              <Clock size={16} className="mr-2" />
              Текущие
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Выполненные
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {renderHomeworkList(currentHomework, "У вас нет текущих домашних заданий.")}
          </TabsContent>
          
          <TabsContent value="completed">
            {renderHomeworkList(completedHomework, "У вас нет выполненных домашних заданий.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
