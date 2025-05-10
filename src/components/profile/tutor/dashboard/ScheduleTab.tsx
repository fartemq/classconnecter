
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

interface ScheduleTabProps {
  tutorId: string;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ tutorId }) => {
  // В реальном приложении здесь был бы хук для загрузки расписания
  const scheduleEntries: any[] = [];
  
  return (
    <Card>
      <CardContent className="py-6">
        {scheduleEntries.length === 0 ? (
          <EmptyState
            title="Расписание не настроено"
            description="Добавьте доступные слоты времени в ваше расписание, чтобы ученики могли записаться к вам на занятия."
            action={
              <Button onClick={() => window.location.href="/profile/tutor?tab=schedule"}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Настроить расписание
              </Button>
            }
          />
        ) : (
          <div>
            {/* Расписание будет здесь */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
