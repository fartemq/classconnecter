
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Clock, DollarSign, Star, Calendar, BookOpen, Target } from "lucide-react";
import { useTutorStatistics } from "@/hooks/useTutorStatistics";
import { Loader } from "@/components/ui/loader";

interface TutorAnalyticsProps {
  tutorId: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export const TutorAnalytics: React.FC<TutorAnalyticsProps> = ({ tutorId }) => {
  const { statistics, isLoading } = useTutorStatistics(tutorId);

  // Mock data for demonstration - in real app this would come from API
  const weeklyLessonsData = [
    { name: 'Пн', lessons: 4, earnings: 4000 },
    { name: 'Вт', lessons: 6, earnings: 6000 },
    { name: 'Ср', lessons: 3, earnings: 3000 },
    { name: 'Чт', lessons: 8, earnings: 8000 },
    { name: 'Пт', lessons: 5, earnings: 5000 },
    { name: 'Сб', lessons: 7, earnings: 7000 },
    { name: 'Вс', lessons: 2, earnings: 2000 },
  ];

  const monthlyProgressData = [
    { month: 'Янв', students: 5, lessons: 45, rating: 4.2 },
    { month: 'Фев', students: 7, lessons: 52, rating: 4.3 },
    { month: 'Мар', students: 8, lessons: 67, rating: 4.4 },
    { month: 'Апр', students: 12, lessons: 89, rating: 4.5 },
    { month: 'Май', students: 15, lessons: 102, rating: 4.6 },
    { month: 'Июн', students: 18, lessons: 124, rating: 4.7 },
  ];

  const subjectsData = [
    { name: 'Математика', students: 8, lessons: 45, earnings: 45000 },
    { name: 'Физика', students: 5, lessons: 28, earnings: 28000 },
    { name: 'Химия', students: 3, lessons: 15, earnings: 15000 },
    { name: 'Биология', students: 2, lessons: 12, earnings: 12000 },
  ];

  const performanceMetrics = [
    { metric: 'Время отклика', value: '2.3 ч', change: '+15%', icon: Clock, color: 'text-blue-600' },
    { metric: 'Конверсия запросов', value: '78%', change: '+5%', icon: Target, color: 'text-green-600' },
    { metric: 'Средняя длительность', value: '1.5 ч', change: '0%', icon: BookOpen, color: 'text-purple-600' },
    { metric: 'Повторные ученики', value: '65%', change: '+12%', icon: Users, color: 'text-orange-600' },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего учеников</p>
                <p className="text-2xl font-bold">{statistics?.totalStudents || 0}</p>
                <p className="text-xs text-green-600">+3 за месяц</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Занятий в месяц</p>
                <p className="text-2xl font-bold">{statistics?.totalLessons || 0}</p>
                <p className="text-xs text-green-600">+12% к прошлому</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Доход в месяц</p>
                <p className="text-2xl font-bold">{((statistics?.totalLessons || 0) * 1000).toLocaleString()} ₽</p>
                <p className="text-xs text-green-600">+8% к прошлому</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Рейтинг</p>
                <p className="text-2xl font-bold">{statistics?.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-green-600">+0.2 за месяц</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Показатели эффективности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                    <span className="text-sm text-green-600 font-medium">{metric.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.metric}</p>
                  <p className="text-xl font-bold">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Активность по дням недели</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyLessonsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="lessons" fill="#8884d8" name="Занятия" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Прогресс по месяцам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#8884d8" name="Ученики" />
                <Line type="monotone" dataKey="rating" stroke="#82ca9d" name="Рейтинг" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение по предметам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subjectsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {subjectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {subjectsData.map((subject, index) => (
                <div key={subject.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{subject.students} учеников</p>
                    <p className="text-xs text-muted-foreground">{subject.lessons} занятий</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
