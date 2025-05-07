import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, Calendar, CheckCircle, Star, Users } from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";

interface TutorDashboardProps {
  profile: Profile;
}

export const TutorDashboard = ({ profile }: TutorDashboardProps) => {
  const { isPublished, isLoading, togglePublishStatus } = useTutorPublishStatus();
  const navigate = useNavigate();
  
  const handleNavigateToSchedule = () => {
    navigate("/profile/tutor?tab=schedule");
  };
  
  const handleNavigateToSettings = () => {
    navigate("/profile/tutor?tab=settings");
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Приветствуем, {profile.first_name}!</h1>
      
      {/* Статус публикации профиля */}
      {isLoading ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 flex justify-center items-center h-24">
            <Loader size="lg" />
          </CardContent>
        </Card>
      ) : (
        <Card className={isPublished ? "bg-green-50" : "bg-amber-50"}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                {isPublished ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                )}
                <div>
                  <h3 className="font-medium">
                    {isPublished 
                      ? "Ваш профиль опубликован" 
                      : "Ваш профиль не опубликован"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isPublished 
                      ? "Студенты могут найти вас в поиске и записаться на занятия" 
                      : "Опубликуйте профиль, чтобы начать принимать студентов"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isPublished && (
                  <Button onClick={handleNavigateToSchedule} variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Настроить расписание
                  </Button>
                )}
                <Button 
                  onClick={isPublished ? handleNavigateToSettings : togglePublishStatus} 
                  variant={isPublished ? "outline" : "default"}
                >
                  {isPublished ? "Управление публикацией" : "Опубликовать профиль"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Активные ученики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Предстоящие занятия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Проведено занятий</CardHeader>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Средний рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">-</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Дополнительные блоки и информация */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Поиск новых учеников
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Загрузить материалы для обучения
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Перейти к сообщениям
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Редактировать расписание
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
