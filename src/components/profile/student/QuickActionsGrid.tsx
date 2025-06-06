
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, BookOpen, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActionsGrid = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Найти преподавателя",
      description: "Поиск по предметам и критериям",
      icon: Search,
      color: "bg-blue-50 text-blue-600",
      onClick: () => navigate('/student/find-tutors')
    },
    {
      title: "Расписание",
      description: "Просмотр предстоящих занятий",
      icon: Calendar,
      color: "bg-green-50 text-green-600",
      onClick: () => navigate('/student/schedule')
    },
    {
      title: "Домашние задания",
      description: "Текущие и выполненные задания",
      icon: BookOpen,
      color: "bg-orange-50 text-orange-600",
      onClick: () => navigate('/student/homework')
    },
    {
      title: "Сообщения",
      description: "Общение с преподавателями",
      icon: MessageCircle,
      color: "bg-purple-50 text-purple-600",
      onClick: () => navigate('/student/chats')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
