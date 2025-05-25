
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageSquare, Star, TrendingUp, BookOpen } from "lucide-react";
import { ProfilePublishSection } from "./publish/ProfilePublishSection";
import { useAuth } from "@/hooks/useAuth";

interface TutorDashboardProps {
  profile: any;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ profile }) => {
  const { user } = useAuth();

  // Check if profile is complete for publishing
  const isProfileComplete = profile && 
    profile.first_name && 
    profile.last_name && 
    profile.city && 
    profile.bio && 
    profile.education_institution && 
    profile.degree && 
    profile.methodology && 
    profile.experience !== undefined;

  const stats = [
    {
      title: "Активные ученики",
      value: "12",
      icon: Users,
      change: "+2 за неделю",
      color: "text-blue-600"
    },
    {
      title: "Занятий в месяце",
      value: "48",
      icon: Calendar,
      change: "+8 за неделю",
      color: "text-green-600"
    },
    {
      title: "Средний рейтинг",
      value: "4.9",
      icon: Star,
      change: "+0.1 за месяц",
      color: "text-yellow-600"
    },
    {
      title: "Доход в месяце",
      value: "72,000 ₽",
      icon: TrendingUp,
      change: "+15% за месяц",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Добро пожаловать, {profile?.first_name || 'Репетитор'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Управляйте своими занятиями и учениками
          </p>
        </div>
        <Badge 
          variant={profile?.is_published ? "default" : "secondary"}
          className={profile?.is_published ? "bg-green-600" : ""}
        >
          {profile?.is_published ? "Профиль опубликован" : "Профиль не опубликован"}
        </Badge>
      </div>

      {/* Publish Profile Section - Show if profile is complete but not published */}
      {isProfileComplete && !profile?.is_published && (
        <ProfilePublishSection tutorId={user?.id || ""} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Добавить занятие
            </Button>
            <Button className="w-full" variant="outline">
              Посмотреть расписание
            </Button>
            <Button className="w-full" variant="outline">
              Управлять предметами
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Новые сообщения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              У вас 3 новых сообщения от учеников
            </p>
            <Button className="w-full">
              Открыть чат
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Материалы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Загрузите материалы для учеников
            </p>
            <Button className="w-full" variant="outline">
              Управлять материалами
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Последние активности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Занятие с Анной завершено</span>
              </div>
              <span className="text-xs text-muted-foreground">2 часа назад</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Новый запрос от Максима</span>
              </div>
              <span className="text-xs text-muted-foreground">4 часа назад</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Занятие завтра в 15:00</span>
              </div>
              <span className="text-xs text-muted-foreground">1 день назад</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
