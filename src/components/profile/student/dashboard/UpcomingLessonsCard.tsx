
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Lesson } from "@/types/lesson";

interface UpcomingLessonsCardProps {
  upcomingLessons: Lesson[];
}

export const UpcomingLessonsCard = ({ upcomingLessons }: UpcomingLessonsCardProps) => {
  const navigate = useNavigate();

  if (upcomingLessons.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Ближайшие занятия</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingLessons.slice(0, 3).map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">{lesson.subject?.name}</p>
                  <p className="text-sm text-gray-500">
                    {lesson.date} в {lesson.time}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {lesson.duration} мин
              </Badge>
            </div>
          ))}
        </div>
        {upcomingLessons.length > 3 && (
          <Button 
            variant="link" 
            className="w-full mt-3"
            onClick={() => navigate("/profile/student/schedule")}
          >
            Показать все занятия
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
