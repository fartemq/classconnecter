
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useLessonRequests } from "@/hooks/useLessonRequests";

interface BookLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  date: Date;
  startTime: string;
  endTime: string;
  subjects: Array<{ id: string; name: string }>;
}

export const BookLessonDialog: React.FC<BookLessonDialogProps> = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  date,
  startTime,
  endTime,
  subjects
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createLessonRequest } = useLessonRequests(user?.id, 'student');
  const [selectedSubject, setSelectedSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите предмет",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const success = await createLessonRequest({
      tutor_id: tutorId,
      subject_id: selectedSubject,
      requested_date: formattedDate,
      requested_start_time: startTime,
      requested_end_time: endTime,
      message: message || undefined
    });

    if (success) {
      onClose();
      setSelectedSubject("");
      setMessage("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Запрос на занятие</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm bg-blue-50 p-3 rounded-lg">
              <p><strong>Репетитор:</strong> {tutorName}</p>
              <p><strong>Дата:</strong> {format(date, 'd MMMM yyyy', { locale: ru })}</p>
              <p><strong>Время:</strong> {startTime.substring(0, 5)} - {endTime.substring(0, 5)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Предмет *</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Сообщение (необязательно)</label>
            <Textarea
              placeholder="Расскажите о своих целях обучения, уровне знаний или задайте вопросы репетитору..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedSubject || isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <Loader size="sm" className="mr-2" />}
              Отправить запрос
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
