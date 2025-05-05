
import React from "react";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ScheduleTab = () => {
  // Mock data - would come from database in real app
  const upcomingLessons = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-600">Ближайшие занятия</h2>
        <Calendar size={22} className="text-blue-600" />
      </div>
      
      <Card>
        <CardContent className="p-6">
          {upcomingLessons.length > 0 ? (
            <div className="space-y-4">
              {/* Lesson items would go here */}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">У вас нет запланированных занятий на ближайшее время</p>
              <Button 
                variant="outline" 
                className="mt-4"
              >
                Найти репетитора
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
