import React from "react";
import { TutorProfile } from "@/types/tutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTutorStatistics } from "@/hooks/useTutorStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePublishControls } from "./ProfilePublishControls";

interface TutorDashboardProps {
  profile: TutorProfile;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ profile }) => {
  const { statistics, isLoading, error } = useTutorStatistics(profile.id);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Панель управления</h1>
      
      {/* Profile Publishing Section */}
      <ProfilePublishControls tutorId={profile.id} />
      
      {/* Statistics cards and other dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Всего уроков</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.totalLessons || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всего часов</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.totalHours || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всего учеников</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.totalStudents || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Средняя оценка</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.averageRating?.toFixed(1) || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всего заработано</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.totalEarnings || 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Заработано в этом месяце</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Загрузка..." : error ? "Ошибка" : statistics?.monthlyEarnings?.[0]?.earnings || 0}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Последние отзывы</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? "Загрузка..." : error ? "Ошибка" : "Здесь будут отзывы"}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Последние материалы</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? "Загрузка..." : error ? "Ошибка" : "Здесь будут материалы"}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Ближайшие занятия</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? "Загрузка..." : error ? "Ошибка" : "Здесь будет расписание"}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
