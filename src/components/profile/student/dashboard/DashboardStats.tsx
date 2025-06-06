
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, TrendingUp, MessageSquare, Check, Crown } from "lucide-react";
import { useStudentDashboard } from "./useStudentDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";

export const DashboardStats = () => {
  const { upcomingLessons, completedLessons, loading } = useStudentDashboard();
  const [unreadAdminMessages, setUnreadAdminMessages] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchUnreadAdminMessages();
    }
  }, [user?.id]);

  const fetchUnreadAdminMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('id')
        .eq('recipient_id', user!.id)
        .eq('is_from_admin', true);

      if (error) {
        console.error("Error fetching admin messages:", error);
        return;
      }

      // Для демонстрации считаем все админские сообщения как непрочитанные
      // В реальном приложении здесь была бы проверка статуса прочтения
      setUnreadAdminMessages(data?.length || 0);
    } catch (error) {
      console.error("Error in fetchUnreadAdminMessages:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Предстоящие занятия",
      value: upcomingLessons.length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Завершенные занятия",
      value: completedLessons.length,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Общий прогресс",
      value: `${Math.round((completedLessons.length / Math.max(completedLessons.length + upcomingLessons.length, 1)) * 100)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Активные чаты",
      value: "3", // Заглушка
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Admin Messages Alert */}
      {unreadAdminMessages > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500 rounded-full">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 flex items-center">
                    Новые сообщения от администрации
                    <Check className="h-4 w-4 ml-2 text-green-600" />
                  </h4>
                  <p className="text-sm text-yellow-700">
                    У вас {unreadAdminMessages} новых сообщений от администрации
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => window.location.href = '/profile/student/chats'}
              >
                Перейти к сообщениям
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
