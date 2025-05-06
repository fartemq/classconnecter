
import React from "react";
import { Clock, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lesson } from "@/types/lesson";

interface LessonsListProps {
  lessons: Lesson[];
}

export const LessonsList = ({ lessons }: LessonsListProps) => {
  const filteredLessons = lessons.filter(lesson => lesson.status === "upcoming");
  
  if (filteredLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Нет занятий</h3>
        <p className="text-gray-500">
          На выбранную дату занятия не запланированы
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {filteredLessons.map(lesson => (
        <div 
          key={lesson.id}
          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-start justify-between"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium">{lesson.subject.name}</h4>
              <p className="text-sm text-gray-600">
                {lesson.tutor.first_name} {lesson.tutor.last_name}
              </p>
              <p className="text-sm text-gray-500">
                {lesson.time.substring(0, 5)} • {lesson.duration} мин.
              </p>
            </div>
          </div>
          <Button size="sm">Подключиться</Button>
        </div>
      ))}
    </div>
  );
};
