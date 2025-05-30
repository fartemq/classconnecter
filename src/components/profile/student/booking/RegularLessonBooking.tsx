
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTutorSlots } from "@/hooks/useTutorSlots";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface RegularLessonBookingProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const RegularLessonBooking: React.FC<RegularLessonBookingProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { availableSlots, loading: slotsLoading } = useTutorSlots(tutor.id, selectedDate);

  React.useEffect(() => {
    if (isOpen) {
      loadTutorSubjects();
    }
  }, [isOpen, tutor.id]);

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

  const handleBookLesson = async () => {
    if (!user || !selectedDate || !selectedSlot || !selectedSubject) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) throw new Error("Слот не найден");

      const startDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${slot.startTime}`;
      const endDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${slot.endTime}`;

      const { error } = await supabase
        .from('lessons')
        .insert({
          tutor_id: tutor.id,
          student_id: user.id,
          subject_id: selectedSubject,
          start_time: startDateTime,
          end_time: endDateTime,
          status: 'confirmed' // Regular lessons are auto-confirmed for established relationships
        });

      if (error) throw error;

      toast({
        title: "Занятие забронировано",
        description: "Занятие успешно добавлено в ваше расписание.",
      });

      onClose();
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Занятие с {tutor.first_name} {tutor.last_name}
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
              disabled={(date) => date < new Date()}
              locale={ru}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="text-sm font-medium mb-2 block">Доступное время</label>
              {slotsLoading ? (
                <div className="text-center py-4">Загрузка...</div>
              ) : availableSlots.length > 0 ? (
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.startTime} - {slot.endTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  На эту дату нет доступных слотов
                </div>
              )}
            </div>
          )}

          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-green-800 mb-1">Обычное занятие:</p>
            <ul className="text-green-700 space-y-1">
              <li>• Полный доступ к расписанию репетитора</li>
              <li>• Автоматическое подтверждение</li>
              <li>• Доступно для постоянных учеников</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleBookLesson} 
              disabled={!selectedDate || !selectedSlot || !selectedSubject || isLoading}
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
