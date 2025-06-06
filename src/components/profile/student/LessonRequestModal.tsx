import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Loader } from "@/components/ui/loader";

interface LessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const LessonRequestModal: React.FC<LessonRequestModalProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createLessonRequest } = useLessonRequests(user?.id, 'student');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    requested_date: '',
    requested_start_time: '10:00',
    requested_end_time: '11:00',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      // Set default date to tomorrow
      const tomorrow = addDays(new Date(), 1);
      setFormData(prev => ({
        ...prev,
        requested_date: format(tomorrow, 'yyyy-MM-dd')
      }));
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

  const validateDuration = (startTime: string, endTime: string): boolean => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.requested_date || !formData.requested_start_time || !formData.requested_end_time) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, укажите предмет, дату и время занятия",
        variant: "destructive"
      });
      return;
    }

    if (!validateDuration(formData.requested_start_time, formData.requested_end_time)) {
      toast({
        title: "Неверное время",
        description: "Занятие должно длиться от 1 до 8 часов",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await createLessonRequest({
        tutor_id: tutor.id,
        subject_id: formData.subject_id,
        requested_date: formData.requested_date,
        requested_start_time: formData.requested_start_time,
        requested_end_time: formData.requested_end_time,
        message: formData.message
      });

      if (success) {
        toast({
          title: "Запрос отправлен",
          description: "Ваш запрос на занятие отправлен репетитору"
        });
        onClose();
        setFormData({
          subject_id: '',
          requested_date: '',
          requested_start_time: '10:00',
          requested_end_time: '11:00',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error creating lesson request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Запрос на занятие
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Репетитор: {tutor.first_name} {tutor.last_name}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Предмет *</Label>
            <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Желаемая дата *</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={formData.requested_date}
                onChange={(e) => setFormData(prev => ({ ...prev, requested_date: e.target.value }))}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Время начала *</Label>
              <div className="relative">
                <Input
                  id="start-time"
                  type="time"
                  value={formData.requested_start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, requested_start_time: e.target.value }))}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">Время окончания *</Label>
              <div className="relative">
                <Input
                  id="end-time"
                  type="time"
                  value={formData.requested_end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, requested_end_time: e.target.value }))}
                  className="pl-10"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение репетитору</Label>
            <div className="relative">
              <Textarea
                id="message"
                placeholder="Расскажите о ваших целях и пожеланиях к занятию..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="pl-10 pt-8"
              />
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader size="sm" className="mr-2" />}
              Отправить запрос
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
