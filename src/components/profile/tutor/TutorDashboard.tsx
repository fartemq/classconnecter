
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatisticsCard } from "./StatisticsCard";
import { UpcomingLessons } from "./UpcomingLessons";
import { NotPublishedAlert } from "./dashboard/NotPublishedAlert";
import { EmptyState } from "./dashboard/EmptyState";
import { useTutorStatistics } from "@/hooks/useTutorStatistics";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ReviewsTab } from "./dashboard/ReviewsTab";
import { MaterialsTab } from "./dashboard/MaterialsTab";
import { ScheduleTab as DashboardScheduleTab } from "./dashboard/ScheduleTab";
import { Profile } from "@/hooks/profiles/types";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";

interface TutorDashboardProps {
  profile: Profile;
}

export const TutorDashboard = ({ profile }: TutorDashboardProps) => {
  const { statistics, isLoading } = useTutorStatistics(profile.id);
  const { isPublished } = useTutorPublishStatus(profile.id);
  
  // Convert Profile to TutorProfile for components that need it
  const tutorProfile = convertProfileToTutorProfile(profile);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-6">Личный кабинет репетитора</h1>
      
      {/* Уведомление о публикации */}
      <NotPublishedAlert isPublished={isPublished} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Профиль репетитора */}
        <div>
          <ProfileInfoCard 
            profile={tutorProfile}
            studentsCount={statistics?.totalStudents || 0}
            averageRating={statistics?.averageRating || 0}
          />
        </div>
        
        {/* Статистика и информация */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatisticsCard 
              title="Всего занятий" 
              value={isLoading ? "..." : `${statistics?.totalLessons || 0}`}
              loading={isLoading}
            />
            <StatisticsCard 
              title="Проведено часов" 
              value={isLoading ? "..." : `${statistics?.totalHours || 0}`}
              loading={isLoading}
            />
            <StatisticsCard 
              title="Активных учеников" 
              value={isLoading ? "..." : `${statistics?.totalStudents || 0}`}
              loading={isLoading}
            />
            <StatisticsCard 
              title="Средняя оценка" 
              value={isLoading ? "..." : `${statistics?.averageRating?.toFixed(1) || 0}`}
              loading={isLoading}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Предстоящие занятия</CardTitle>
              <CardDescription>Ваши ближайшие занятия с учениками</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader size="lg" />
                </div>
              ) : statistics && statistics.totalLessons > 0 ? (
                <UpcomingLessons tutorId={profile.id} />
              ) : (
                <EmptyState
                  title="У вас пока нет занятий"
                  description="Ученики могут записаться к вам на занятия, когда вы опубликуете свой профиль и установите расписание."
                  action={isPublished ? 
                    <Button variant="outline" onClick={() => window.location.href="/profile/tutor?tab=schedule"}>
                      Настроить расписание
                    </Button> : 
                    <Button variant="outline" onClick={() => window.location.href="/profile/tutor?tab=profile"}>
                      Опубликовать профиль
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Табы с дополнительной информацией */}
      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews">
          <ReviewsTab tutorId={profile.id} />
        </TabsContent>
        
        <TabsContent value="materials">
          <MaterialsTab tutorId={profile.id} />
        </TabsContent>
        
        <TabsContent value="schedule">
          <DashboardScheduleTab tutorId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
