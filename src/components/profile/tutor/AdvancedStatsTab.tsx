
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TutorStatistics } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedStatsTabProps {
  tutorId: string;
}

export const AdvancedStatsTab = ({ tutorId }: AdvancedStatsTabProps) => {
  const [statistics, setStatistics] = useState<TutorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchStatistics();
  }, [tutorId, period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // В реальном приложении здесь был бы запрос к API для получения статистики
      // Поскольку мы еще не имеем полной структуры БД, создаем тестовые данные
      
      // Имитация задержки загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Генерируем тестовые данные для месячного заработка
      const monthlyEarnings = [];
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      
      for (let i = 0; i < 12; i++) {
        monthlyEarnings.push({
          month: months[i],
          earnings: Math.floor(Math.random() * 50000) + 10000
        });
      }
      
      const mockStatistics = {
        totalLessons: 156,
        totalHours: 234,
        totalStudents: 15,
        averageRating: 4.8,
        totalEarnings: 425600,
        monthlyEarnings
      };
      
      setStatistics(mockStatistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Анализ работы</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">{statistics?.totalLessons}</span>
            <span className="text-sm text-gray-500 mt-2">Всего занятий</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">{statistics?.totalHours}</span>
            <span className="text-sm text-gray-500 mt-2">Общие часы</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">{statistics?.totalStudents}</span>
            <span className="text-sm text-gray-500 mt-2">Учеников обучено</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <span className="text-4xl font-bold text-primary">{statistics?.averageRating}</span>
            <span className="text-sm text-gray-500 mt-2">Средний рейтинг</span>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Финансовая статистика</CardTitle>
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">За месяц</SelectItem>
                <SelectItem value="quarter">За квартал</SelectItem>
                <SelectItem value="year">За год</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div>
              <span className="text-sm text-gray-500">Общий доход</span>
              <div className="text-2xl font-bold">{formatCurrency(statistics?.totalEarnings || 0)}</div>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="text-sm text-gray-500">Средний доход в месяц</span>
              <div className="text-2xl font-bold">
                {formatCurrency((statistics?.totalEarnings || 0) / 12)}
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statistics?.monthlyEarnings}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Доход']} />
                <Bar dataKey="earnings" fill="#3b82f6" name="Доход" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Динамика активных учеников</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { month: 'Янв', students: 3 },
                  { month: 'Фев', students: 5 },
                  { month: 'Мар', students: 6 },
                  { month: 'Апр', students: 8 },
                  { month: 'Май', students: 7 },
                  { month: 'Июн', students: 11 },
                  { month: 'Июл', students: 13 },
                  { month: 'Авг', students: 12 },
                  { month: 'Сен', students: 14 },
                  { month: 'Окт', students: 15 },
                  { month: 'Ноя', students: 15 },
                  { month: 'Дек', students: 15 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} учеников`, 'Активные']} />
                <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
