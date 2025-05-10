
import React from "react";
import { TutorProfile } from "@/types/tutor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTutorStatistics } from "@/hooks/useTutorStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePublishControls } from "./ProfilePublishControls";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { RecommendationAlert } from "./publish/RecommendationAlert";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface TutorDashboardProps {
  profile: TutorProfile;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ profile }) => {
  const { statistics, isLoading, error } = useTutorStatistics(profile.id);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Панель управления</h1>
      
      {/* Welcome and Profile Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Добро пожаловать, {profile.firstName}!</h2>
                <p className="text-gray-600">
                  Управляйте своим профилем, отслеживайте занятия и общайтесь с учениками в одном месте.
                </p>
                
                {!profile.isPublished && (
                  <RecommendationAlert 
                    title="Опубликуйте ваш профиль" 
                    message="Заполните все необходимые данные и опубликуйте профиль, чтобы студенты могли вас найти."
                  />
                )}
                
                <ProfilePublishControls tutorId={profile.id} />
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Предстоящие занятия</CardTitle>
              <CardDescription>Ваши ближайшие запланированные уроки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder for upcoming lessons */}
                <div className="flex items-center p-3 border rounded-md">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Математика - Алгебра</p>
                    <p className="text-sm text-gray-500">Иван Петров</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(new Date(), "dd.MM.yyyy")}</p>
                    <p className="text-sm text-gray-500">15:00 - 16:30</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">Посмотреть все занятия</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Info Card */}
        <div>
          <ProfileInfoCard 
            profile={profile}
            studentsCount={statistics?.totalStudents || 0}
            averageRating={statistics?.averageRating || 4.5}
          />
        </div>
      </div>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Всего уроков</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : error ? "Ошибка" : statistics?.totalLessons || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Всего часов</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : error ? "Ошибка" : statistics?.totalHours || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Всего учеников</p>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : error ? "Ошибка" : statistics?.totalStudents || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="materials">Учебные материалы</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Последние отзывы</CardTitle>
              <CardDescription>Что говорят о вас ваши ученики</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? "Загрузка..." : error ? "Ошибка загрузки отзывов" : 
                <div className="text-center py-4 text-gray-500">У вас пока нет отзывов</div>
              }
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Учебные материалы</CardTitle>
              <CardDescription>Ваши загруженные материалы для студентов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-gray-500">
                У вас пока нет загруженных материалов
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Расписание занятий</CardTitle>
              <CardDescription>Ваши активные слоты расписания</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-gray-500">
                Настройте ваше расписание во вкладке "Расписание"
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
