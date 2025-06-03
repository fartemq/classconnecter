
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MessageSquare, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { NotPublishedAlert } from "./dashboard/NotPublishedAlert";
import { ProfilePublishControls } from "./ProfilePublishControls";
import { Profile } from "@/hooks/profiles/types";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";

interface TutorDashboardProps {
  profile: Profile;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ profile }) => {
  const { isPublished } = useTutorPublishStatus(profile.id);

  return (
    <div className="space-y-6">
      {/* Profile Publication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Статус публикации профиля</span>
            {isPublished ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Опубликован
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <XCircle className="w-4 h-4 mr-1" />
                Не опубликован
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {isPublished 
              ? "Ваш профиль доступен для поиска студентами"
              : "Опубликуйте профиль, чтобы студенты могли найти вас"
            }
          </p>
          <ProfilePublishControls tutorId={profile.id} />
        </CardContent>
      </Card>

      {/* Alert for unpublished profile */}
      <NotPublishedAlert isPublished={isPublished} />

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Добро пожаловать, {profile.first_name}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Управляйте своим профилем репетитора, расписанием и учениками.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Учеников</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Занятий на неделе</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Новых сообщений</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">0₽</p>
                <p className="text-sm text-muted-foreground">Доход за месяц</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Последняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Здесь будет отображаться ваша последняя активность
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
