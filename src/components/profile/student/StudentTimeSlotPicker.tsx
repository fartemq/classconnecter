
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Check } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}

interface StudentTimeSlotPickerProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  tutorName: string;
  subject: string;
  timeSlots: TimeSlot[];
}

export const StudentTimeSlotPicker: React.FC<StudentTimeSlotPickerProps> = ({
  isOpen,
  onClose,
  requestId,
  tutorName,
  subject,
  timeSlots
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!selectedSlot) {
      toast({
        title: "Выберите время",
        description: "Пожалуйста, выберите подходящий вариант времени",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Получаем данные запроса
      const { data: requestData, error: requestError } = await supabase
        .from('lesson_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Создаем занятие в таблице lessons
      const startDateTime = `${selectedSlot.date}T${selectedSlot.start_time}`;
      const endDateTime = `${selectedSlot.date}T${selectedSlot.end_time}`;

      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          tutor_id: requestData.tutor_id,
          student_id: requestData.student_id,
          subject_id: requestData.subject_id,
          start_time: startDateTime,
          end_time: endDateTime,
          status: 'confirmed'
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Обновляем статус запроса
      const { error: updateError } = await supabase
        .from('lesson_requests')
        .update({
          status: 'confirmed',
          requested_date: selectedSlot.date,
          requested_start_time: selectedSlot.start_time,
          requested_end_time: selectedSlot.end_time,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: "Занятие подтверждено",
        description: "Занятие успешно забронировано. Репетитор получит уведомление."
      });

      onClose();
    } catch (error) {
      console.error('Error confirming time slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить время",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Выберите удобное время</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Репетитор: {tutorName} • Предмет: {subject}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Репетитор предложил следующие варианты времени:
          </p>

          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedSlot === slot 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSlot(slot)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(parseISO(slot.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: ru })}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                    </div>
                    
                    {selectedSlot === slot && (
                      <Badge className="bg-blue-500">
                        <Check className="h-3 w-3 mr-1" />
                        Выбрано
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading || !selectedSlot}
              className="flex-1"
            >
              {isLoading && <Loader size="sm" className="mr-2" />}
              Подтвердить занятие
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
