
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, MessageSquare, 
  BookText, Edit, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface StudentDashboardProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city?: string | null;
    school?: string | null;
    grade?: string | null;
    bio?: string | null;
    phone?: string | null;
  };
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const navigate = useNavigate();
  
  // Calculate profile completion percentage
  const profileProgress = useMemo(() => {
    let completedFields = 0;
    let totalFields = 6; // Total number of important profile fields
    
    if (profile.first_name) completedFields++;
    if (profile.last_name) completedFields++;
    if (profile.city) completedFields++;
    if (profile.school) completedFields++;
    if (profile.grade) completedFields++;
    if (profile.bio) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }, [profile]);
  
  // Mock data for demonstration
  const upcomingLessons = [];
  
  // Only show the profile completion card if profile is not 100% complete
  const showProfileCompletion = profileProgress < 100;
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onClick={() => navigate("/tutors")}
                >
                  Найти репетитора
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Messages section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">Сообщения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>У вас нет новых сообщений</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => navigate("/profile/student/chats")}
              >
                Перейти к сообщениям
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Profile completion - only show if not 100% complete */}
      {showProfileCompletion && (
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
                {!profile.school && (
                  <div className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <span className="text-gray-400 text-xs">○</span>
                      </div>
                      <span className="text-gray-500">Учебное заведение</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/profile/student/edit")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {!profile.grade && (
                  <div className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <span className="text-gray-400 text-xs">○</span>
                      </div>
                      <span className="text-gray-500">Класс/Курс</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/profile/student/edit")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
