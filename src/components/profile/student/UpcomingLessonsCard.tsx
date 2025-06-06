
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  subject: string;
  time: string;
  tutor: string;
}

interface UpcomingLessonsCardProps {
  lessons: Lesson[];
}

export const UpcomingLessonsCard = ({ lessons }: UpcomingLessonsCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Ближайшие занятия</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Нет запланированных занятий</p>
            <Button onClick={() => navigate("/student/find-tutors")}>
              Найти репетитора
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.slice(0, 3).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{lesson.subject}</p>
                    <p className="text-sm text-gray-500">
                      {lesson.time} с {lesson.tutor}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Сегодня
                </Badge>
              </div>
            ))}
            {lessons.length > 3 && (
              <Button 
                variant="link" 
                className="w-full mt-3"
                onClick={() => navigate("/student/schedule")}
              >
                Показать все занятия
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
