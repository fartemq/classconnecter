
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Star, BookOpen, Users, Pencil, CheckCircle, Calendar, BarChart } from "lucide-react";
import { TutorProfile } from "@/types/tutor";

interface TutorSidebarProps {
  profile: TutorProfile;
}

export const TutorSidebar = ({ profile }: TutorSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // This would ideally come from the database in a real implementation
  const tutorStats = {
    rating: profile.rating || 4.8,
    reviewsCount: profile.reviewsCount || 12,
    lessonsCount: profile.completedLessons || 45,
    studentsCount: profile.activeStudents || 8,
    profileCompleteness: 65
  };
  
  // Определить активную вкладку из URL
  const getActiveTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get("tab") || "dashboard";
  };

  // Перейти на вкладку заполнения профиля
  const navigateToProfileTab = (tab: string) => {
    navigate(`/profile/tutor?tab=${tab}`);
  };
  
  // Проверить, заполнены ли основные разделы профиля
  const profileSections = [
    { name: "О себе", completed: Boolean(profile?.firstName && profile?.lastName && profile?.bio), tab: "about" },
    { name: "Методология", completed: Boolean(profile?.methodology), tab: "methodology" },
    { name: "Учебные материалы", completed: false, tab: "materials" },
    { name: "Расписание", completed: false, tab: "schedule" }
  ];

  return (
    <div className="space-y-4">
      {/* Профиль репетитора */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={`${profile.firstName} ${profile.lastName || ''}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  {profile?.firstName?.charAt(0) || "Р"}
                </div>
              )}
            </div>
            
            {/* Verification badge */}
            <Badge className="absolute bottom-0 right-1/4 bg-green-500 hover:bg-green-600">
              Проверено
            </Badge>
          </div>
          
          <h2 className="text-xl font-semibold mb-1">
            {profile?.firstName} {profile?.lastName}
          </h2>
          
          {profile?.city && (
            <div className="flex items-center justify-center text-gray-500 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{profile.city}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center mb-2">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-medium">{tutorStats.rating}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({tutorStats.reviewsCount} отзывов)
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <BookOpen className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-500">Занятий</p>
              <p className="font-medium">{tutorStats.lessonsCount}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-500">Учеников</p>
              <p className="font-medium">{tutorStats.studentsCount}</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigateToProfileTab("about")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Редактировать профиль
          </Button>
        </CardContent>
      </Card>

      {/* Заполнение профиля */}
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-medium">Заполнение профиля</h3>
          <div className="flex items-center justify-between text-sm mt-1">
            <span>Прогресс</span>
            <span className="font-medium">{tutorStats.profileCompleteness}%</span>
          </div>
          <Progress value={tutorStats.profileCompleteness} className="h-2" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-3">
            {profileSections.map((section) => (
              <div 
                key={section.name}
                className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition-colors"
                onClick={() => navigateToProfileTab(section.tab)}
              >
                <div className="flex items-center">
                  {section.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                  )}
                  <span className={section.completed ? "text-gray-700" : "text-gray-500"}>
                    {section.name}
                  </span>
                </div>
                <Pencil className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Быстрый доступ</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs justify-start"
                onClick={() => navigateToProfileTab("schedule")}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Расписание
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs justify-start"
                onClick={() => navigateToProfileTab("students")}
              >
                <Users className="h-3 w-3 mr-1" />
                Ученики
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs justify-start"
                onClick={() => navigateToProfileTab("stats")}
              >
                <BarChart className="h-3 w-3 mr-1" />
                Статистика
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs justify-start"
                onClick={() => navigateToProfileTab("materials")}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Материалы
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
