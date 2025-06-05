
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  BookOpen, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useLessons } from "@/hooks/useLessons";

export const StudentDashboardTab = () => {
  const navigate = useNavigate();
  const { profile } = useProfile("student");
  const { lessons } = useLessons();

  // Подсчет статистики
  const upcomingLessons = lessons?.filter(lesson => 
    lesson.status === "upcoming" && new Date(lesson.date) >= new Date()
  ) || [];
  
  const completedLessons = lessons?.filter(lesson => 
    lesson.status === "completed"
  ) || [];

  // Проверка заполненности профиля
  const isProfileComplete = profile && 
    profile.first_name && 
    profile.last_name && 
    profile.city && 
    profile.bio &&
    profile.student_profiles?.educational_level &&
    profile.student_profiles?.subjects?.length;

  const quickActions = [
    {
      title: "Найти репетитора",
      description: "Поиск новых репетиторов",
      icon: Users,
      color: "bg-blue-500",
      action: () => navigate("/profile/student/find-tutors")
    },
    {
      title: "Расписание",
      description: "Управление занятиями",
      icon: Calendar,
      color: "bg-green-500",
      action: () => navigate("/profile/student/schedule")
    },
    {
      title: "Домашние задания",
      description: "Проверить задания",
      icon: BookOpen,
      color: "bg-orange-500",
      action: () => navigate("/profile/student/homework")
    },
    {
      title: "Сообщения",
      description: "Чат с репетиторами",
      icon: MessageSquare,
      color: "bg-purple-500",
      action: () => navigate("/profile/student/chats")
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Добро пожаловать, {profile?.first_name || "Студент"}!
        </h1>
        <p className="text-gray-600">
          Управляйте своим обучением в одном месте
        </p>
      </div>

      {/* Предупреждение о незавершенном профиле */}
      {!isProfileComplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-orange-800 font-medium">
                  Профиль не завершен
                </p>
                <p className="text-orange-700 text-sm">
                  Заполните профиль для лучшего подбора репетиторов
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate("/profile/student/profile")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Заполнить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Предстоящие занятия
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLessons.length}</div>
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
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons.length}</div>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">
              Рост за месяц
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
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

      {/* Ближайшие занятия */}
      {upcomingLessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Ближайшие занятия</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLessons.slice(0, 3).map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{lesson.subject?.name}</p>
                      <p className="text-sm text-gray-500">
                        {lesson.date} в {lesson.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {lesson.duration} мин
                  </Badge>
                </div>
              ))}
            </div>
            {upcomingLessons.length > 3 && (
              <Button 
                variant="link" 
                className="w-full mt-3"
                onClick={() => navigate("/profile/student/schedule")}
              >
                Показать все занятия
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
