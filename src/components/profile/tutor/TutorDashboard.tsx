
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  FileText,
  ChartBar,
  LayoutDashboard,
  Bulb,
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

interface TutorDashboardProps {
  profile: Profile;
}

// Sample data for charts
const incomeData = [
  { month: 'Янв', income: 15000 },
  { month: 'Фев', income: 22000 },
  { month: 'Мар', income: 19000 },
  { month: 'Апр', income: 25000 },
  { month: 'Май', income: 28000 },
  { month: 'Июн', income: 30000 },
];

const studentsData = [
  { month: 'Янв', students: 4 },
  { month: 'Фев', students: 6 },
  { month: 'Мар', students: 5 },
  { month: 'Апр', students: 7 },
  { month: 'Май', students: 9 },
  { month: 'Июн', students: 10 },
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming classes */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
            <CardTitle className="flex items-center text-lg font-medium text-blue-700">
              <CalendarDays className="h-5 w-5 mr-2" />
              Ближайшие занятия
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-6">
              <p className="text-gray-500">У вас нет запланированных занятий на ближайшее время</p>
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

        {/* Homework reminders */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 pb-2">
            <CardTitle className="flex items-center text-lg font-medium text-emerald-700">
              <FileText className="h-5 w-5 mr-2" />
              Домашние задания
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-6">
              <p className="text-gray-500">Нет активных домашних заданий для проверки</p>
              <Button 
                variant="link" 
                className="mt-2 text-emerald-600"
              >
                Создать новое задание
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-2">
          <CardTitle className="flex items-center text-lg font-medium text-purple-700">
            <ChartBar className="h-5 w-5 mr-2" />
            Статистика
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
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

      {/* Quick access sections */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 pb-2">
          <CardTitle className="flex items-center text-lg font-medium text-amber-700">
            <LayoutDashboard className="h-5 w-5 mr-2" />
            Быстрый доступ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
              onClick={() => navigate("/profile/tutor?tab=about")}
            >
              <span className="text-lg">О себе</span>
              <span className="text-xs text-gray-500">Редактировать профиль</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:text-green-700 border-green-200"
              onClick={() => navigate("/profile/tutor?tab=schedule")}
            >
              <span className="text-lg">Расписание</span>
              <span className="text-xs text-gray-500">Управление временем</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:text-purple-700 border-purple-200"
              onClick={() => navigate("/profile/tutor?tab=students")}
            >
              <span className="text-lg">Ученики</span>
              <span className="text-xs text-gray-500">Просмотр списка учеников</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200"
              onClick={() => navigate("/profile/tutor?tab=chats")}
            >
              <span className="text-lg">Сообщения</span>
              <span className="text-xs text-gray-500">Общение с учениками</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-700 border-amber-200"
              onClick={() => navigate("/profile/tutor?tab=stats")}
            >
              <span className="text-lg">Статистика</span>
              <span className="text-xs text-gray-500">Анализ прогресса</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:text-red-700 border-red-200"
              onClick={() => navigate("/profile/tutor?tab=settings")}
            >
              <span className="text-lg">Настройки</span>
              <span className="text-xs text-gray-500">Параметры аккаунта</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motivational quote */}
      <Card className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-600 to-indigo-700">
        <CardContent className="p-6 text-center">
          <Bulb className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
          <p className="text-white text-xl font-medium italic">"{randomQuote}"</p>
        </CardContent>
      </Card>
    </div>
  );
};
