
import React from "react";
import { Clock, CalendarIcon, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lesson } from "@/types/lesson";
import { useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LessonsListProps {
  lessons: Lesson[];
}

export const LessonsList = ({ lessons }: LessonsListProps) => {
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [lessonToCancel, setLessonToCancel] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();
  
  const filteredLessons = lessons.filter(lesson => lesson.status === "upcoming" || lesson.status === "confirmed");
  
  const handleContactTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };
  
  const openCancelDialog = (lessonId: string) => {
    setLessonToCancel(lessonId);
    setCancelDialogOpen(true);
  };
  
  const cancelLesson = async () => {
    if (!lessonToCancel) return;
    
    try {
      setCanceling(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'canceled' })
        .eq('id', lessonToCancel);
      
      if (error) throw error;
      
      toast({
        title: "Занятие отменено",
        description: "Занятие было успешно отменено",
      });
      
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error canceling lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить занятие",
        variant: "destructive"
      });
    } finally {
      setCanceling(false);
    }
  };
  
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
          className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            lesson.status === 'confirmed' ? 'border-green-200 bg-green-50' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium">{lesson.subject?.name}</h4>
              {lesson.tutor && (
                <p className="text-sm text-gray-600">
                  {lesson.tutor.first_name} {lesson.tutor.last_name || ''}
                </p>
              )}
              <div className="flex items-center flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  {lesson.time.substring(0, 5)} • {lesson.duration} мин.
                </p>
                <Badge status={lesson.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleContactTutor(lesson.tutor_id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Связаться
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => openCancelDialog(lesson.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Отменить
            </Button>
          </div>
        </div>
      ))}
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отменить занятие</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отменить это занятие?
              Отмена может повлечь за собой штрафные санкции согласно правилам платформы.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={canceling}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={cancelLesson}
              disabled={canceling}
            >
              {canceling ? "Отменяем..." : "Отменить занятие"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Компонент для отображения статуса занятия
const Badge = ({ status }: { status: string }) => {
  switch (status) {
    case 'upcoming':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Ожидает подтверждения
        </span>
      );
    case 'confirmed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Подтверждено
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Завершено
        </span>
      );
    case 'canceled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          Отменено
        </span>
      );
    default:
      return null;
  }
};
