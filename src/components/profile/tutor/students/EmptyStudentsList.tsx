
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock } from "lucide-react";

interface EmptyStudentsListProps {
  onCheckRequests: () => void;
}

export const EmptyStudentsList = ({ onCheckRequests }: EmptyStudentsListProps) => {
  return (
    <Card className="border border-dashed">
      <CardContent className="text-center py-10">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Нет учеников</h3>
        <p className="text-gray-500 mb-4">
          У вас пока нет учеников. Добавьте новых учеников через раздел "Поиск учеников".
        </p>
        <Button onClick={onCheckRequests}>
          <Clock className="mr-2 h-4 w-4" />
          Проверить запросы
        </Button>
      </CardContent>
    </Card>
  );
};
