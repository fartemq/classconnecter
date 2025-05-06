
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book, CheckCircle } from "lucide-react";

interface EmptyStateProps {
  type: "current" | "completed";
  hasFilters: boolean;
}

export const EmptyState = ({ type, hasFilters }: EmptyStateProps) => {
  const icon = type === "current" ? <Book className="h-12 w-12 text-gray-400 mb-4" /> : <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />;
  
  const title = type === "current" ? "Нет домашних заданий" : "Нет выполненных заданий";
  
  const message = hasFilters
    ? "Попробуйте изменить параметры поиска"
    : type === "current"
    ? "У вас пока нет активных домашних заданий"
    : "У вас пока нет выполненных домашних заданий";

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );
};
