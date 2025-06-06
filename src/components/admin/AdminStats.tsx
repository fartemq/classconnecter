
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, FileText, BookOpen, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface AdminStatsData {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  pendingDocuments: number;
  totalSubjects: number;
  activeTutorProfiles: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Получаем статистику пользователей
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      // Получаем статистику документов
      const { data: documents } = await supabase
        .from('document_verifications')
        .select('status');

      // Получаем статистику предметов
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('is_active', true);

      // Получаем статистику опубликованных профилей репетиторов
      const { data: tutorProfiles } = await supabase
        .from('tutor_profiles')
        .select('is_published');

      const totalUsers = profiles?.length || 0;
      const totalTutors = profiles?.filter(p => p.role === 'tutor').length || 0;
      const totalStudents = profiles?.filter(p => p.role === 'student').length || 0;
      const pendingDocuments = documents?.filter(d => d.status === 'pending').length || 0;
      const totalSubjects = subjects?.length || 0;
      const activeTutorProfiles = tutorProfiles?.filter(tp => tp.is_published).length || 0;

      setStats({
        totalUsers,
        totalTutors,
        totalStudents,
        pendingDocuments,
        totalSubjects,
        activeTutorProfiles
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Не удалось загрузить статистику</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Обзор системы</h2>
        <p className="text-gray-600">Общая статистика платформы Stud.rep</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Все зарегистрированные пользователи
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Репетиторы</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTutors}</div>
            <p className="text-xs text-muted-foreground">
              Активно: {stats.activeTutorProfiles} профилей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Студенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Зарегистрированные студенты
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Документы на проверке</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Требуют проверки
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные предметы</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Доступных предметов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Публикация профилей</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTutorProfiles}</div>
            <p className="text-xs text-muted-foreground">
              из {stats.totalTutors} опубликованы
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
