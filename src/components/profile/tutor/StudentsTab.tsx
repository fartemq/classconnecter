
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const StudentsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Поиск учеников</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Заполните свой профиль полностью, чтобы привлечь больше учеников
          </p>
          <Button>Найти учеников</Button>
        </div>
      </CardContent>
    </Card>
  );
};
