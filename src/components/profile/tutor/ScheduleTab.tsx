
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export const ScheduleTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Расписание занятий</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          У вас пока нет запланированных занятий.
        </div>
      </CardContent>
    </Card>
  );
};
