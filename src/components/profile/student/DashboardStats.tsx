
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BookOpen, Star } from "lucide-react";

interface DashboardStatsProps {
  totalTutors: number;
  activeRequests: number;
  completedLessons: number;
  averageRating: number;
}

export const DashboardStats = ({ 
  totalTutors, 
  activeRequests, 
  completedLessons, 
  averageRating 
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Доступные преподаватели",
      value: totalTutors,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Активные заявки",
      value: activeRequests,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Проведено уроков",
      value: completedLessons,
      icon: BookOpen,
      color: "text-green-600"
    },
    {
      title: "Средняя оценка",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
