
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, BookOpen, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActionsGrid = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Найти репетитора",
      description: "Поиск новых репетиторов",
      icon: Users,
      color: "bg-blue-500",
      action: () => navigate("/student/find-tutors")
    },
    {
      title: "Расписание",
      description: "Управление занятиями",
      icon: Calendar,
      color: "bg-green-500",
      action: () => navigate("/student/schedule")
    },
    {
      title: "Домашние задания",
      description: "Проверить задания",
      icon: BookOpen,
      color: "bg-orange-500",
      action: () => navigate("/student/homework")
    },
    {
      title: "Сообщения",
      description: "Чат с репетиторами",
      icon: MessageSquare,
      color: "bg-purple-500",
      action: () => navigate("/student/chats")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={action.action}
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
