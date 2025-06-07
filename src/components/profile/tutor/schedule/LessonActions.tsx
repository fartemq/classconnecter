
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Video, MessageCircle, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonActionsProps {
  lessonId: string;
  status: string;
  startTime: string;
  studentName?: string;
}

export const LessonActions: React.FC<LessonActionsProps> = ({ 
  lessonId, 
  status, 
  startTime,
  studentName 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartLesson = () => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    // Allow starting lesson 15 minutes before scheduled time
    if (minutesUntilStart > 15) {
      toast({
        title: "Урок ещё не начался",
        description: `До начала урока осталось ${minutesUntilStart} минут`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Запускаем урок...",
      description: `Подключаемся к уроку с ${studentName || 'учеником'}`,
    });

    navigate(`/lesson/${lessonId}`);
  };

  const isLessonTime = () => {
    const now = new Date();
    const lessonStart = new Date(startTime);
    const lessonEnd = new Date(lessonStart.getTime() + 60 * 60 * 1000); // +1 hour
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    return minutesUntilStart <= 15 && now <= lessonEnd;
  };

  if (status !== 'confirmed') {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        onClick={handleStartLesson}
        disabled={!isLessonTime()}
        className="flex items-center space-x-1"
      >
        <Video className="w-4 h-4" />
        <span>Начать урок</span>
      </Button>
      
      {!isLessonTime() && (
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          <span>Доступно за 15 мин до урока</span>
        </div>
      )}
    </div>
  );
};
