import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface ScheduleBasedLessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  date: Date;
  startTime: string;
  endTime: string;
}

export const ScheduleBasedLessonRequestModal: React.FC<ScheduleBasedLessonRequestModalProps> = ({
  isOpen,
  onClose,
  tutor,
  date,
  startTime,
  endTime
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast({
        title: "Выберите предмет",
        description: "Пожалуйста, укажите предмет для занятия",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user?.id,
          tutor_id: tutor.id,
          subject_id: selectedSubject,
          requested_date: format(date, 'yyyy-MM-dd'),
          requested_start_time: startTime,
          requested_end_time: endTime,
          message: message || undefined,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на занятие отправлен репетитору"
      });

      onClose();
      setSelectedSubject("");
      setMessage("");
    } catch (error) {
      console.error('Error creating lesson request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Запрос на занятие</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm">
              <p><strong>Репетитор:</strong> {tutor.first_name} {tutor.last_name}</p>
              <p><strong>Дата:</strong> {format(date, 'd MMMM yyyy', { locale: ru })}</p>
              <p><strong>Время:</strong> {startTime} - {endTime}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Предмет *</Label>
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
            <Label htmlFor="message">Сообщение (необязательно)</Label>
            <Textarea
              placeholder="Добавьте комментарий к вашему запросу..."
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
              disabled={!selectedSubject || isLoading}
              className="flex-1"
            >
              {isLoading && <Loader size="sm" className="mr-2" />}
              Отправить запрос
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
