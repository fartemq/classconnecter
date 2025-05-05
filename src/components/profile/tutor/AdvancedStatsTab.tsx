
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/hooks/use-toast";
import { TutorStatistics } from "@/types/tutor";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface AdvancedStatsTabProps {
  tutorId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdvancedStatsTab = ({ tutorId }: AdvancedStatsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TutorStatistics | null>(null);
  const [reviewsDistribution, setReviewsDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, [tutorId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Получаем количество отзывов
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("tutor_reviews")
        .select("rating")
        .eq("tutor_id", tutorId);

      if (reviewsError) throw reviewsError;

      // Получаем материалы
      const { data: materialsData, error: materialsError } = await supabase
        .from("tutor_materials")
        .select("*")
        .eq("tutor_id", tutorId);

      if (materialsError) throw materialsError;

      // Получаем слоты расписания
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("tutor_schedule")
        .select("*")
        .eq("tutor_id", tutorId);

      if (scheduleError) throw scheduleError;

      // Получаем предметы
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select("hourly_rate")
        .eq("tutor_id", tutorId);

      if (subjectsError) throw subjectsError;

      // Вычисляем среднюю оценку
      let averageRating = 0;
      if (reviewsData && reviewsData.length > 0) {
        averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
      }

      // Распределение оценок
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
        const count = reviewsData ? reviewsData.filter(r => r.rating === rating).length : 0;
        return {
          name: `${rating} ${rating === 1 ? 'звезда' : rating < 5 ? 'звезды' : 'звезд'}`,
          value: count
        };
      });
      setReviewsDistribution(ratingDistribution);

      // Вычисляем среднюю ставку
      let averageRate = 0;
      if (subjectsData && subjectsData.length > 0) {
        averageRate = subjectsData.reduce((sum, subject) => sum + subject.hourly_rate, 0) / subjectsData.length;
      }

      // Пример для демонстрации - в реальности эти данные должны быть получены из базы данных
      const monthlyEarnings = [
        { month: "Январь", earnings: 0 },
        { month: "Февраль", earnings: 0 },
        { month: "Март", earnings: 0 },
        { month: "Апрель", earnings: 0 },
        { month: "Май", earnings: 0 },
        { month: "Июнь", earnings: 0 },
        { month: "Июль", earnings: 0 },
        { month: "Август", earnings: 0 },
        { month: "Сентябрь", earnings: 0 },
        { month: "Октябрь", earnings: 0 },
        { month: "Ноябрь", earnings: 0 },
        { month: "Декабрь", earnings: 0 },
      ];

      setStats({
        totalLessons: 0, // В будущем можно получать из таблицы уроков
        totalHours: 0, // В будущем можно вычислять из продолжительности уроков
        totalStudents: 0, // В будущем можно вычислять из уникальных студентов
        averageRating: averageRating,
        totalEarnings: 0, // В будущем можно вычислять из уроков и ставок
        monthlyEarnings: monthlyEarnings,
        totalReviews: reviewsData?.length || 0,
        totalMaterials: materialsData?.length || 0,
        scheduledSlots: scheduleData?.length || 0,
        averageRate: averageRate
      });
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
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Статистика вашего профиля</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Средний рейтинг</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}</p>
              <p className="ml-2 text-yellow-500">★</p>
              <p className="ml-1 text-gray-400">({stats?.totalReviews || 0} отзывов)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Учебные материалы</p>
            <p className="text-3xl font-bold">{stats?.totalMaterials || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Средняя ставка</p>
            <p className="text-3xl font-bold">{formatCurrency(stats?.averageRate || 0)}/час</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Временных слотов</p>
            <p className="text-3xl font-bold">{stats?.scheduledSlots || 0}</p>
          </CardContent>
        </Card>
      </div>
      
      {stats?.totalReviews ? (
        <Card>
          <CardHeader>
            <CardTitle>Распределение оценок</CardTitle>
            <CardDescription>Анализ отзывов и оценок ваших учеников</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewsDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} отзывов`, 'Количество']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
      
      <Card>
        <CardHeader>
          <CardTitle>Доход по месяцам</CardTitle>
          <CardDescription>Данные будут отображаться по мере проведения занятий</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.monthlyEarnings}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Доход']} />
                <Bar dataKey="earnings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
