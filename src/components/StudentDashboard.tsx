
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Clock, Users, BookOpen, MessageSquare, 
  BookText, GraduationCap, BookMarked, Edit, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StudentDashboardProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city?: string | null;
    school?: string | null;
    grade?: string | null;
  };
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const upcomingLessons = [];
  
  const tutorMessages = [
    { 
      id: 1, 
      name: "Анна Петрова", 
      message: "Не забудьте подготовить задания к занятию", 
      time: "12:30" 
    },
    { 
      id: 2, 
      name: "Иван Иванов", 
      message: "Проверил ваше домашнее задание, отличная работа!", 
      time: "Вчера" 
    }
  ];

  const profileProgress = 65;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center pt-6 pb-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl mb-3 relative">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.first_name} ${profile.last_name || ""}`} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{(profile.first_name[0] || "").toUpperCase()}</span>
                )}
                <Badge className="absolute bottom-1 right-0 bg-green-500 text-xs px-2">Проверено</Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-1">
                {profile.first_name} {profile.last_name}
              </h3>
              
              <p className="text-gray-500 text-sm mb-3">
                {profile.city || "Не указан"}
              </p>
              
              <div className="flex items-center space-x-1 text-amber-500 mb-2">
                <span className="text-lg font-bold">4.8</span>
                <span className="text-xs">(12 отзывов)</span>
              </div>
              
              <div className="grid grid-cols-2 w-full px-6 gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <Calendar className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-xs text-gray-500">Занятий</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="h-6 w-6 text-purple-500 mb-1" />
                  <span className="text-xs text-gray-500">Репетиторов</span>
                  <span className="font-bold">3</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4 w-full mx-6"
                onClick={() => navigate("/profile/student/edit")}
              >
                <Edit className="mr-2 h-4 w-4" />
                Редактировать профиль
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming lessons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-600">Ближайшие занятия</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length > 0 ? (
              <div className="space-y-4">
                {upcomingLessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{lesson.subject}</h4>
                      <p className="text-sm text-gray-600">
                        {lesson.tutor} • {lesson.date}, {lesson.time}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Детали
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>У вас нет запланированных занятий на ближайшее время</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => navigate("/profile/student/schedule")}
                >
                  Перейти к расписанию
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Homework section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">Домашние задания</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Нет активных домашних заданий для проверки</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate("/profile/student/homework")}
              >
                Создать новое задание
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profile completion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Заполнение профиля</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Прогресс</span>
              <span className="font-medium">{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
            
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>О себе</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile/student/edit")}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <span className="text-gray-400 text-xs">○</span>
                  </div>
                  <span className="text-gray-500">Цели обучения</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile/student/edit")}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-purple-600">
            <BookText className="mr-2 h-5 w-5" />
            Статистика
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-center font-medium mb-4">Количество занятий по месяцам</h3>
              <div className="h-64 border rounded-lg flex items-center justify-center text-gray-400">
                График занятий
              </div>
            </div>
            <div>
              <h3 className="text-center font-medium mb-4">Количество репетиторов по месяцам</h3>
              <div className="h-64 border rounded-lg flex items-center justify-center text-gray-400">
                График репетиторов
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button variant="link" className="text-purple-600">
              Подробная статистика <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
