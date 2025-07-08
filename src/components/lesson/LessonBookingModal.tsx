import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { format, addDays, isBefore, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";

interface LessonBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  subjects: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
  lessonType?: "trial" | "regular";
}

export const LessonBookingModal: React.FC<LessonBookingModalProps> = ({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  subjects,
  lessonType = "trial"
}) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Генерируем временные слоты
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Загружаем доступные слоты для выбранной даты
  const loadAvailableSlots = async (date: Date) => {
    if (!date) return;
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Получаем расписание репетитора на выбранный день недели
      const dayOfWeek = date.getDay();
      const { data: scheduleData } = await supabase
        .from('tutor_schedule')
        .select('start_time, end_time')
        .eq('tutor_id', tutorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (!scheduleData || scheduleData.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Получаем уже забронированные слоты
      const { data: bookedSlots } = await supabase
        .from('lessons')
        .select('start_time')
        .eq('tutor_id', tutorId)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lt('start_time', `${formattedDate}T23:59:59`)
        .in('status', ['pending', 'confirmed', 'upcoming']);

      // Генерируем доступные слоты на основе расписания
      const allSlots = generateTimeSlots();
      const available = allSlots.filter(slot => {
        // Проверяем, что слот в рамках рабочего времени
        const slotTime = slot;
        const isInWorkingHours = scheduleData.some(schedule => {
          return slotTime >= schedule.start_time && slotTime < schedule.end_time;
        });

        if (!isInWorkingHours) return false;

        // Проверяем, что слот не забронирован
        const isBooked = bookedSlots?.some(booked => {
          const bookedTime = format(new Date(booked.start_time), 'HH:mm');
          return bookedTime === slotTime;
        });

        return !isBooked;
      });

      setAvailableSlots(available);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, tutorId]);

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedTime || !selectedSubject) {
      toast({
        title: "Заполните все поля",
        description: "Выберите дату, время и предмет для урока",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Создаем запрос на урок
      const lessonDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      lessonDateTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          subject_id: selectedSubject,
          requested_date: format(selectedDate, 'yyyy-MM-dd'),
          requested_start_time: selectedTime,
          requested_end_time: `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          message: message || `Запрос на ${lessonType === 'trial' ? 'пробный' : 'обычный'} урок`,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен!",
        description: "Репетитор получит уведомление и ответит вам в ближайшее время",
      });

      onClose();
      
      // Сбрасываем форму
      setSelectedDate(undefined);
      setSelectedTime("");
      setSelectedSubject("");
      setMessage("");
      
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на урок",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Проверяем доступность даты (не раньше завтра)
  const isDateDisabled = (date: Date) => {
    return isBefore(date, new Date()) && !isToday(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {lessonType === 'trial' ? 'Пробный урок' : 'Обычный урок'} с {tutorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Выбор предмета */}
          <div>
            <Label htmlFor="subject">Предмет</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} - {subject.hourlyRate} ₽/час
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Выбор даты */}
          <div>
            <Label>Дата урока</Label>
            <Card className="p-4 mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                locale={ru}
                className="rounded-md border-0"
                fromDate={addDays(new Date(), 1)}
              />
            </Card>
          </div>

          {/* Выбор времени */}
          {selectedDate && (
            <div>
              <Label>Время урока</Label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(slot)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot}
                    </Button>
                  ))}
                </div>
              ) : (
                <Card className="p-4 mt-2">
                  <p className="text-center text-muted-foreground">
                    На выбранную дату нет доступных временных слотов
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* Сообщение репетитору */}
          <div>
            <Label htmlFor="message">Сообщение репетитору (необязательно)</Label>
            <Textarea
              id="message"
              placeholder="Расскажите о ваших целях обучения, уровне подготовки или задайте вопросы..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Информация о типе урока */}
          <Card className={`p-4 ${lessonType === 'trial' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
            <div className="flex items-start gap-3">
              <Badge className={lessonType === 'trial' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {lessonType === 'trial' ? 'Пробный урок' : 'Обычный урок'}
              </Badge>
              <div className="text-sm">
                {lessonType === 'trial' ? (
                  <p>
                    Пробный урок обычно проводится со скидкой или бесплатно. 
                    Это возможность познакомиться с методикой репетитора.
                  </p>
                ) : (
                  <p>
                    Обычный урок по полной стоимости. Для бронирования необходимо 
                    предварительно договориться с репетитором.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || !selectedSubject || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                "Отправка..."
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Отправить запрос
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};