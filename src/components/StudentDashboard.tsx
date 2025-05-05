
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Clock, Users, BookOpen, MessageSquare, 
  BookText, GraduationCap, BookMarked 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface StudentDashboardProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const StudentDashboard = ({ profile }: StudentDashboardProps) => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const upcomingLessons = [
    { 
      id: 1, 
      subject: "Математика", 
      tutor: "Анна Петрова", 
      time: "15:30 - 17:00", 
      date: "Сегодня" 
    },
    { 
      id: 2, 
      subject: "Английский язык", 
      tutor: "Иван Иванов", 
      time: "10:00 - 11:30", 
      date: "Завтра" 
    }
  ];
  
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Добро пожаловать, {profile.first_name}!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-lg font-medium">2</span>
                <span className="text-sm text-gray-600">Занятия сегодня</span>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-lg font-medium">3</span>
                <span className="text-sm text-gray-600">Активных репетиторов</span>
              </div>
              <Users className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-lg font-medium">5</span>
                <span className="text-sm text-gray-600">Предметов изучается</span>
              </div>
              <BookMarked className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming lessons */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Ближайшие занятия
            </CardTitle>
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
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/profile/student/schedule")}
                >
                  Смотреть расписание
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>У вас нет предстоящих занятий</p>
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
        
        {/* Recent messages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
              Сообщения от репетиторов
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tutorMessages.length > 0 ? (
              <div className="space-y-4">
                {tutorMessages.map(message => (
                  <div key={message.id} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium">{message.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{message.name}</h4>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/profile/student/chats")}
                >
                  Просмотреть все сообщения
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>У вас нет новых сообщений</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/tutors")}
              >
                <Users className="h-6 w-6 text-blue-500" />
                <span>Найти репетитора</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/profile/student/schedule")}
              >
                <Calendar className="h-6 w-6 text-green-500" />
                <span>Расписание</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/profile/student/homework")}
              >
                <BookText className="h-6 w-6 text-amber-500" />
                <span>Домашние задания</span>
                <Badge className="absolute -top-2 -right-2">1</Badge>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-6 px-4 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/profile/student/favorites")}
              >
                <GraduationCap className="h-6 w-6 text-purple-500" />
                <span>Избранные репетиторы</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
