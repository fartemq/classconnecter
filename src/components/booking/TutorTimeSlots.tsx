import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { generateTutorTimeSlots } from "@/services/lesson/timeSlotsService";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TutorTimeSlotsProps {
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

export const TutorTimeSlots: React.FC<TutorTimeSlotsProps> = ({
  tutorId,
  selectedDate,
  selectedSubjectId,
  subjectName,
  hourlyRate
}) => {
  const { user } = useAuth();
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Доступное время</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Доступное время</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Доступное время</CardTitle>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Доступное время</CardTitle>
          <p className="text-sm text-muted-foreground">
            {subjectName} • {hourlyRate}₽/час • {format(selectedDate, "d MMMM", { locale: ru })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map(slot => (
              <Button
                key={slot.slot_id}
                variant={selectedSlot?.slot_id === slot.slot_id ? "default" : "outline"}
                className="h-auto py-3"
                onClick={() => handleSlotSelect(slot)}
                disabled={!slot.is_available}
              >
                <div className="flex flex-col items-center">
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-sm">
                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Подтверждение бронирования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Детали занятия:</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Предмет:</strong> {subjectName}</p>
                <p><strong>Дата:</strong> {format(selectedDate, "d MMMM yyyy", { locale: ru })}</p>
                <p><strong>Время:</strong> {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}</p>
                <p><strong>Стоимость:</strong> {hourlyRate}₽/час</p>
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
              />
            </div>

            <div className="flex space-x-3">
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
                className="flex-1"
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