
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsCardProps {
  title: string;
  value: string;
  loading?: boolean;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title, 
  value, 
  loading = false 
}) => {
  return (
    <Card className="border-none">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        {loading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
};
