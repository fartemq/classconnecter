
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Предстоящие занятия</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Нет запланированных занятий</p>
            <Button variant="outline" size="sm" className="mt-3">
              Запланировать занятие
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">{lesson.subject}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{lesson.tutor}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Подключиться
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
