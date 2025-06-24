
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Homework } from "@/types/homework";

interface HomeworkCardProps {
  homework: Homework;
  viewMode: 'student' | 'tutor';
  onView: (homework: Homework) => void;
  onSubmit?: (homework: Homework) => void;
  onGrade?: (homework: Homework) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  viewMode,
  onView,
  onSubmit,
  onGrade
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Назначено';
      case 'submitted': return 'Отправлено';
      case 'graded': return 'Проверено';
      default: return status;
    }
  };

  const isOverdue = homework.due_date && new Date(homework.due_date) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{homework.title}</CardTitle>
          <Badge className={getStatusColor(homework.status)}>
            {getStatusText(homework.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-gray-600 line-clamp-2">{homework.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {homework.due_date 
                ? format(new Date(homework.due_date), 'dd MMM yyyy', { locale: ru })
                : 'Без срока'
              }
            </span>
          </div>
          
          {homework.subject && (
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{homework.subject.name}</span>
            </div>
          )}
          
          {viewMode === 'student' && homework.tutor && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{homework.tutor.first_name} {homework.tutor.last_name}</span>
            </div>
          )}
          
          {viewMode === 'tutor' && homework.student && (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{homework.student.first_name} {homework.student.last_name}</span>
            </div>
          )}
        </div>

        {homework.grade && (
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span className="text-sm font-medium">Оценка:</span>
            <span className="font-bold text-green-700">{homework.grade}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={() => onView(homework)}>
            <FileText className="h-4 w-4 mr-1" />
            Подробнее
          </Button>
          
          <div className="flex space-x-2">
            {viewMode === 'student' && homework.status === 'assigned' && onSubmit && (
              <Button size="sm" onClick={() => onSubmit(homework)}>
                Сдать работу
              </Button>
            )}
            
            {viewMode === 'tutor' && homework.status === 'submitted' && onGrade && (
              <Button size="sm" onClick={() => onGrade(homework)}>
                Оценить
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
