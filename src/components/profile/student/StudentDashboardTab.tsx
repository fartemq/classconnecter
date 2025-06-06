
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Search,
  User,
  BarChart3,
  Settings 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const StudentDashboardTab = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  const quickActions = [
    {
      title: "Найти репетитора",
      description: "Поиск новых репетиторов",
      icon: Search,
      color: "bg-blue-500",
      path: "/profile/student/find-tutors"
    },
    {
      title: "Расписание",
      description: "Управление занятиями",
      icon: Calendar,
      color: "bg-green-500",
      path: "/profile/student/schedule"
    },
    {
      title: "Домашние задания",
      description: "Проверить задания",
      icon: BookOpen,
      color: "bg-orange-500",
      path: "/profile/student/homework",
      badge: 1
    },
    {
      title: "Сообщения",
      description: "Чат с репетиторами",
      icon: MessageSquare,
      color: "bg-purple-500",
      path: "/profile/student/chats",
      badge: 2
    },
    {
      title: "Мои репетиторы",
      description: "Текущие репетиторы",
      icon: Users,
      color: "bg-indigo-500",
      path: "/profile/student/my-tutors"
    },
    {
      title: "Моя анкета",
      description: "Редактировать профиль",
      icon: User,
      color: "bg-gray-500",
      path: "/profile/student/profile"
    },
    {
      title: "Мой прогресс",
      description: "Статистика обучения",
      icon: BarChart3,
      color: "bg-teal-500",
      path: "/profile/student/progress"
    },
    {
      title: "Настройки",
      description: "Настройки аккаунта",
      icon: Settings,
      color: "bg-gray-600",
      path: "/profile/student/settings"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile completion alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-orange-800">Профиль не завершен</h3>
                <p className="text-sm text-orange-600">
                  Заполните профиль для лучшего подбора репетиторов
                </p>
              </div>
            </div>
            <Button 
              onClick={() => handleNavigation("/profile/student/profile")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Заполнить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Предстоящие занятия
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              На этой неделе
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Завершенные занятия
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Всего проведено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Прогресс
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              Рост за месяц
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                onClick={() => handleNavigation(action.path)}
              >
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center relative`}>
                  <action.icon className="h-6 w-6 text-white" />
                  {action.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
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
    </div>
  );
};
