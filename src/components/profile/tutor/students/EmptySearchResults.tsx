
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

interface EmptySearchResultsProps {
  onFindNewStudents: () => void;
}

export const EmptySearchResults = ({ onFindNewStudents }: EmptySearchResultsProps) => {
  return (
    <Card className="border border-dashed">
      <CardContent className="text-center py-10">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Студенты не найдены</h3>
        <p className="text-gray-500 mb-4">
          Не найдено студентов, соответствующих вашим критериям поиска
        </p>
        <Button onClick={onFindNewStudents}>
          <UserPlus className="mr-2 h-4 w-4" />
          Найти новых учеников
        </Button>
      </CardContent>
    </Card>
  );
};
