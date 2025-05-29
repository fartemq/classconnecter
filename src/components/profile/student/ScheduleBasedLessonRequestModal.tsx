
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { User, BookOpen, MessageSquare, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { format, addDays, startOfDay, isBefore, isAfter } from "date-fns";
import { ru } from "date-fns/locale";

interface ScheduleBasedLessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

interface AvailableSlot {
  date: string;
  time_slot: TimeSlot;
}

export const ScheduleBasedLessonRequestModal: React.FC<ScheduleBasedLessonRequestModalProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    message: ''
  });

  // Генерируем даты на следующие 14 дней
  const getNext14Days = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, tutor.id]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject_id,
          subjects:subject_id (id, name)
        `)
        .eq('tutor_id', tutor.id)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const formattedSubjects = data?.map(item => ({
        id: (item.subjects as any).id,
        name: (item.subjects as any).name
      })) || [];
      
      setSubjects(formattedSubjects);
      
      if (formattedSubjects.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: formattedSubjects[0].id }));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      setIsLoading(true);
      
      // Получаем день недели (1-7, где 1 = понедельник)
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      const formattedDate = format(date, 'yyyy-MM-dd');

      // Получаем расписание репетитора на этот день недели
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('tutor_schedule')
        .select('*')
        .eq('tutor_id', tutor.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (scheduleError) throw scheduleError;

      if (!scheduleData || scheduleData.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Получаем уже забронированные занятия на эту дату
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('start_time, end_time')
        .eq('tutor_id', tutor.id)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lte('start_time', `${formattedDate}T23:59:59`)
        .in('status', ['pending', 'confirmed']);

      if (lessonsError) throw lessonsError;

      // Фильтруем доступные слоты, исключая забронированные
      const available = scheduleData.filter(slot => {
        // Проверяем, не пересекается ли этот слот с уже забронированными
        return !lessonsData?.some(lesson => {
          const lessonStart = new Date(lesson.start_time).toTimeString().slice(0, 5);
          const lessonEnd = new Date(lesson.end_time).toTimeString().slice(0, 5);
          return (slot.start_time < lessonEnd && slot.end_time > lessonStart);
        });
      });

      const formattedSlots: AvailableSlot[] = available.map(slot => ({
        date: formattedDate,
        time_slot: {
          id: slot.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          day_of_week: slot.day_of_week
        }
      }));

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить доступное время",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !selectedSlot) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, выберите предмет и время для занятий",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Создаем запрос на занятие с предложенным временем
      const timeSlotData = {
        date: selectedSlot.date,
        start_time: selectedSlot.time_slot.start_time,
        end_time: selectedSlot.time_slot.end_time
      };

      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user?.id,
          tutor_id: tutor.id,
          subject_id: formData.subject_id,
          requested_date: selectedSlot.date,
          requested_start_time: selectedSlot.time_slot.start_time,
          requested_end_time: selectedSlot.time_slot.end_time,
          message: formData.message,
          status: 'time_slots_proposed', // Сразу устанавливаем статус с предложенным временем
          tutor_response: JSON.stringify([timeSlotData]) // Сохраняем выбранное время как предложение репетитора
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Репетитор получит ваш запрос на выбранное время"
      });

      onClose();
      setFormData({
        subject_id: '',
        message: ''
      });
      setSelectedDate(undefined);
      setSelectedSlot(null);
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

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 14);
    return isBefore(date, addDays(today, 1)) || isAfter(date, maxDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Запрос на занятие
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Репетитор: {tutor.first_name} {tutor.last_name}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Левая колонка - Предмет и сообщение */}
            <div className="space-y-4">
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
                <Label htmlFor="message">Сообщение репетитору</Label>
                <div className="relative">
                  <Textarea
                    id="message"
                    placeholder="Расскажите о ваших целях и пожеланиях к занятиям..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    className="pl-10 pt-8"
                  />
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Правая колонка - Календарь и время */}
            <div className="space-y-4">
              <div>
                <Label>Выберите дату *</Label>
                <Card className="p-2 mt-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    locale={ru}
                    className="border-0"
                  />
                </Card>
              </div>

              {selectedDate && (
                <div>
                  <Label>Доступное время {format(selectedDate, "d MMMM", { locale: ru })} *</Label>
                  {isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedSlot(slot)}
                          className="text-sm py-2 h-auto"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.time_slot.start_time.slice(0, 5)} - {slot.time_slot.end_time.slice(0, 5)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md text-center mt-2">
                      <p className="text-gray-500 text-sm">
                        Нет доступных слотов на эту дату
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Выберите удобное время из расписания репетитора. После отправки запроса репетитор получит уведомление и сможет подтвердить занятие.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || !selectedSlot || !formData.subject_id} className="flex-1">
              {isLoading && <Loader size="sm" className="mr-2" />}
              Отправить запрос
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
