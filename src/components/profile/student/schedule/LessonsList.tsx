
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Lesson } from "@/types/lesson";

interface LessonsListProps {
  lessons: Lesson[];
}

export const LessonsList = ({ lessons }: LessonsListProps) => {
  if (lessons.length === 0) {
    return (
      <p className="text-gray-500">
        Нет запланированных занятий на этот день
      </p>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Подтверждено</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Отменено</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Завершено</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Ожидает подтверждения</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Предстоит</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="border rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-1">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                <span className="text-sm font-medium">
                  {lesson.time.substring(0, 5)} ({lesson.duration} мин)
                </span>
              </div>
              <h3 className="font-medium">
                {lesson.subject?.name || 'Без предмета'}
              </h3>
              {lesson.tutor && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <User className="w-3 h-3 mr-1" />
                  {lesson.tutor.first_name} {lesson.tutor.last_name || ''}
                </div>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(lesson.status)}
              <div className="flex items-center justify-end text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(lesson.date), 'dd.MM.yyyy')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
