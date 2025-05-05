
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  FileText,
  ChartBar,
  LayoutDashboard,
  Lightbulb,
  Users,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/hooks/useProfile";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface TutorDashboardProps {
  profile: Profile;
}

// Sample data for charts
const incomeData = [
  { month: 'Июн', income: 0 },
  { month: 'Июл', income: 0 },
  { month: 'Авг', income: 0 },
  { month: 'Сен', income: 0 },
  { month: 'Окт', income: 15000 },
  { month: 'Ноя', income: 30000 },
];

const studentsData = [
  { month: 'Июн', students: 0 },
  { month: 'Июл', students: 0 },
  { month: 'Авг', students: 0 },
  { month: 'Сен', students: 0 },
  { month: 'Окт', students: 6 },
  { month: 'Ноя', students: 12 },
];

// Motivational quotes
const motivationalQuotes = [
  "Обучая других, вы учитесь сами.",
  "Каждый урок - это возможность изменить чью-то жизнь.",
  "Знания - единственное богатство, которое растет, когда им делятся.",
  "Хороший учитель объясняет, великий учитель вдохновляет.",
  "Образование - это не подготовка к жизни, это сама жизнь."
];

export const TutorDashboard = ({ profile }: TutorDashboardProps) => {
  const navigate = useNavigate();
  
  // Get random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left column */}
      <div className="md:col-span-1 space-y-6">
        {/* Tutor profile card */}
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={`${profile.first_name} ${profile.last_name || ''}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      {profile?.first_name?.charAt(0) || "Р"}
                    </div>
                  )}
                </div>
                
                {/* Verification badge */}
                <Badge className="absolute bottom-0 right-1/4 bg-green-500 hover:bg-green-600">
                  Проверено
                </Badge>
              </div>
              
              <h2 className="text-xl font-semibold mb-1">
                {profile?.first_name} {profile?.last_name}
              </h2>
              
              {profile?.city && (
                <div className="flex items-center justify-center text-gray-500 text-sm mb-2">
                  <span>{profile.city}</span>
                </div>
              )}
              
              <div className="flex items-center justify-center mb-4">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="font-medium">4.8</span>
                <span className="text-gray-500 text-sm ml-1">
                  (12 отзывов)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-blue-500 mb-1">
                    <CalendarDays className="h-5 w-5 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-500">Занятий</div>
                  <div className="font-medium">45</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-500 mb-1">
                    <Users className="h-5 w-5 mx-auto" />
                  </div>
                  <div className="text-sm text-gray-500">Учеников</div>
                  <div className="font-medium">8</div>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={() => navigate("/profile/tutor?tab=about")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать профиль
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile completion */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-medium">Заполнение профиля</h3>
            <div className="flex items-center justify-between text-sm mt-1">
              <span>Прогресс</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <div className="h-5 w-5 text-green-500 mr-2">✓</div>
                  <span className="text-gray-700">О себе</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                  <span className="text-gray-500">Методология</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                  <span className="text-gray-500">Учебные материалы</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center">
                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2" />
                  <span className="text-gray-500">Расписание</span>
                </div>
                <Edit className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Быстрый доступ</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => navigate("/profile/tutor?tab=schedule")}
                >
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Расписание
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => navigate("/profile/tutor?tab=students")}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Ученики
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => navigate("/profile/tutor?tab=stats")}
                >
                  <ChartBar className="h-3 w-3 mr-1" />
                  Статистика
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs justify-start"
                  onClick={() => navigate("/profile/tutor?tab=materials")}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Материалы
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column (main content) */}
      <div className="md:col-span-2 space-y-6">
        {/* Upcoming classes and homework assignments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming classes */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-600">
                Ближайшие занятия
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  У вас нет запланированных занятий на ближайшее время
                </p>
                <Button 
                  variant="link" 
                  className="mt-2 text-blue-600"
                  onClick={() => navigate("/profile/tutor?tab=schedule")}
                >
                  Перейти к расписанию
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Homework assignments */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-green-600">
                Домашние задания
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Нет активных домашних заданий для проверки
                </p>
                <Button 
                  variant="link" 
                  className="mt-2 text-green-600"
                >
                  Создать новое задание
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-purple-600 flex items-center">
              <ChartBar className="h-5 w-5 mr-2" />
              Статистика
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-medium mb-2 text-center">Доход за последние 6 месяцев</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={incomeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" name="Доход (₽)" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-purple-600 mt-2">
                  Доход (₽)
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 text-center">Количество учеников по месяцам</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={studentsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#82ca9d" name="Ученики" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-green-600 mt-2">
                  Ученики
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <Button 
                variant="link" 
                className="text-purple-600"
                onClick={() => navigate("/profile/tutor?tab=stats")}
              >
                Подробная статистика
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Motivational quote */}
        <Card className="shadow-sm bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <p className="text-white text-xl font-medium italic">"{randomQuote}"</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
