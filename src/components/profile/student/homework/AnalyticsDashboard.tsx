
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AnalyticsDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Статистика выполнения</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Выполнено</span>
              <span className="font-medium">5 из 8</span>
            </div>
            <Progress value={62.5} />
            
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 font-bold text-3xl">5</div>
                <div className="text-sm text-gray-600">Выполнено</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-bold text-3xl">3</div>
                <div className="text-sm text-gray-600">В процессе</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Средняя оценка</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-amber-50 flex items-center justify-center">
            <span className="text-5xl font-bold text-amber-600">4.7</span>
          </div>
          <div className="mt-4 space-y-2 w-full">
            <div className="flex justify-between text-sm">
              <span>Математика</span>
              <span className="font-medium">5.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Физика</span>
              <span className="font-medium">4.5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Английский</span>
              <span className="font-medium">4.7</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Сроки выполнения</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Сдано вовремя</span>
              <span className="font-medium">80%</span>
            </div>
            <Progress value={80} />
            
            <div className="pt-4 space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div className="text-sm">Вовремя: 4 задания</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <div className="text-sm">С опозданием: 1 задание</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="text-sm">Просрочено: 0 заданий</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
