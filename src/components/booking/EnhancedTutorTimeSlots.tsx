import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateTutorTimeSlots } from "@/services/lesson/timeSlotsService";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface EnhancedTutorTimeSlotsProps {
  tutorId: string;
  selectedDate: Date;
  selectedSubjectId: string;
  subjectName: string;
  hourlyRate: number;
}

interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const EnhancedTutorTimeSlots: React.FC<EnhancedTutorTimeSlotsProps> = ({
  tutorId,
  selectedDate,
  selectedSubjectId,
  subjectName,
  hourlyRate
}) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['tutorTimeSlots', tutorId, selectedDate?.toDateString()],
    queryFn: () => generateTutorTimeSlots(tutorId, selectedDate),
    enabled: !!tutorId && !!selectedDate
  });

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.is_available) {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !user?.id) return;

    setIsBooking(true);
    try {
      // Create lesson request
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          subject_id: selectedSubjectId,
          requested_date: format(selectedDate, 'yyyy-MM-dd'),
          requested_start_time: selectedSlot.start_time,
          requested_end_time: selectedSlot.end_time,
          message: message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на занятие отправлен репетитору. Вы получите уведомление о статусе."
      });

      // Reset form
      setSelectedSlot(null);
      setMessage("");
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на занятие",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.round(diff / (1000 * 60)); // minutes
  };

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Доступное время
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Доступное время
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Ошибка при загрузке расписания</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeSlots.length) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Доступное время
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>На выбранную дату нет доступного времени</p>
            <p className="text-sm">Попробуйте выбрать другую дату</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.is_available);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Доступное время
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {subjectName} • {hourlyRate}₽/час • {format(selectedDate, "d MMMM", { locale: ru })}
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {availableSlots.length} свободных слотов
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {timeSlots.map(slot => {
              const duration = getDuration(slot.start_time, slot.end_time);
              return (
                <Card
                  key={slot.slot_id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    !slot.is_available 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : selectedSlot?.slot_id === slot.slot_id 
                        ? 'ring-2 ring-primary bg-primary/5 shadow-lg' 
                        : 'hover:border-primary/40 hover:bg-primary/2'
                  }`}
                  onClick={() => handleSlotSelect(slot)}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className={`h-4 w-4 ${
                          selectedSlot?.slot_id === slot.slot_id 
                            ? 'text-primary' 
                            : slot.is_available 
                              ? 'text-gray-600' 
                              : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="font-medium text-lg">
                        {slot.start_time.substring(0, 5)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {duration} мин
                      </div>
                      {!slot.is_available && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Занято</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <Card className="border-green-200 bg-green-50/50 animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-green-100 to-transparent">
            <CardTitle className="text-green-800">Подтверждение бронирования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-medium mb-3 text-green-800">Детали занятия:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Предмет:</span>
                  <span className="font-medium">{subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Дата:</span>
                  <span className="font-medium">{format(selectedDate, "d MMMM yyyy", { locale: ru })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Время:</span>
                  <span className="font-medium">
                    {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Длительность:</span>
                  <span className="font-medium">
                    {getDuration(selectedSlot.start_time, selectedSlot.end_time)} мин
                  </span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <span className="text-muted-foreground">Стоимость:</span>
                  <span className="font-medium text-green-600">{hourlyRate}₽/час</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Сообщение репетитору (необязательно)</Label>
              <Textarea
                id="message"
                placeholder="Опишите ваши цели и пожелания к занятию..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                onClick={() => setSelectedSlot(null)}
                variant="outline"
                className="flex-1"
              >
                Отменить
              </Button>
              <Button
                onClick={handleBooking}
                disabled={isBooking}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isBooking ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" />
                    Отправка...
                  </>
                ) : (
                  "Отправить запрос"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};