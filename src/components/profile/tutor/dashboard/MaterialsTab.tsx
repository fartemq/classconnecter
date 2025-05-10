
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MaterialsTabProps {
  tutorId: string;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ tutorId }) => {
  // В реальном приложении здесь был бы хук для загрузки материалов
  const materials: any[] = [];
  
  return (
    <Card>
      <CardContent className="py-6">
        {materials.length === 0 ? (
          <EmptyState
            title="У вас нет учебных материалов"
            description="Загрузите материалы для ваших учеников. Они будут доступны во время занятий."
            action={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить материалы
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Список материалов будет здесь */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
