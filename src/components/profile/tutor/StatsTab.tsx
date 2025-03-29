
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export const StatsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Просмотры профиля</p>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Заявки на уроки</p>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Проведенные уроки</p>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Доход (30 дней)</p>
              <p className="text-3xl font-bold">0 ₽</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
