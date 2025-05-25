
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";

interface TutorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    subjects?: any[];
  };
  onBookingComplete?: () => void;
}

export const TutorBookingModal: React.FC<TutorBookingModalProps> = ({
  isOpen,
  onClose,
  tutor,
  onBookingComplete
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedSubject || !user) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, выберите дату, время и предмет",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          tutor_id: tutor.id,
          subject_id: selectedSubject,
          requested_date: selectedDate.toISOString().split('T')[0],
          requested_start_time: selectedTime,
          requested_end_time: getEndTime(selectedTime),
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен!",
        description: "Репетитор получит уведомление о вашем запросе на занятие",
      });

      onBookingComplete?.();
      onClose();
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");
      setSelectedSubject("");
      setMessage("");
      
    } catch (error) {
      console.error("Error booking lesson:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на занятие",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Запись на занятие к {tutor.first_name} {tutor.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-2">
              <Label>Выберите дату</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            {/* Time and Subject */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Время занятия</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} - {getEndTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Предмет</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutor.subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Дополнительная информация (необязательно)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Расскажите репетитору о ваших целях или особых пожеланиях к занятию..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={isLoading || !selectedDate || !selectedTime || !selectedSubject}
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
