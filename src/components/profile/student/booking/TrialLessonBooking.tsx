
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";

interface TrialLessonBookingProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const TrialLessonBooking: React.FC<TrialLessonBookingProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Trial lesson slots - limited availability (e.g., only certain times)
  const trialSlots = [
    "10:00", "11:00", "14:00", "15:00", "16:00"
  ];

  React.useEffect(() => {
    if (isOpen) {
      loadTutorSubjects();
    }
  }, [isOpen, tutor.id]);

  React.useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadTutorSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          id,
          subject_id,
          hourly_rate,
          subjects:subject_id (name)
        `)
        .eq('tutor_id', tutor.id)
        .eq('is_active', true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Get existing lessons for this date
      const { data: lessons } = await supabase
        .from('lessons')
        .select('start_time, end_time')
        .eq('tutor_id', tutor.id)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lte('start_time', `${formattedDate}T23:59:59`)
        .in('status', ['pending', 'confirmed']);

      // Filter out booked slots from trial slots
      const bookedTimes = lessons?.map(lesson => 
        format(new Date(lesson.start_time), 'HH:mm')
      ) || [];

      const available = trialSlots.filter(slot => !bookedTimes.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots(trialSlots);
    }
  };

  const handleBookTrial = async () => {
    if (!user || !selectedDate || !selectedTime || !selectedSubject) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const startDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`;
      const endDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${
        String(parseInt(selectedTime.split(':')[0]) + 1).padStart(2, '0')
      }:${selectedTime.split(':')[1]}:00`;

      const { error } = await supabase
        .from('lessons')
        .insert({
          tutor_id: tutor.id,
          student_id: user.id,
          subject_id: selectedSubject,
          start_time: startDateTime,
          end_time: endDateTime,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Пробное занятие забронировано",
        description: "Ваш запрос отправлен репетитору. Ожидайте подтверждения.",
      });

      onClose();
    } catch (error) {
      console.error('Error booking trial lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow booking for next 7 days
  const maxDate = addDays(new Date(), 7);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Пробное занятие с {tutor.first_name} {tutor.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Предмет</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.subject_id}>
                    {subject.subjects?.name} - {subject.hourly_rate} ₽
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Дата</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => 
                date < new Date() || date > maxDate || date.getDay() === 0 || date.getDay() === 6
              }
              locale={ru}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="text-sm font-medium mb-2 block">Время</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-800 mb-1">Пробное занятие:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Длительность: 60 минут</li>
              <li>• Доступно только в рабочие дни</li>
              <li>• Ограниченные временные слоты</li>
              <li>• Требует подтверждения репетитора</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleBookTrial} 
              disabled={!selectedDate || !selectedTime || !selectedSubject || isLoading}
              className="flex-1"
            >
              {isLoading ? "Бронирование..." : "Забронировать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
