
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export const HomeworkTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Домашние задания</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          У вас пока нет домашних заданий.
        </div>
      </CardContent>
    </Card>
  );
};
