
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateTutorTimeSlots, TimeSlot } from "@/services/lesson/timeSlotsService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TutorScheduleViewProps {
  tutorId: string;
  tutorName: string;
  onClose?: () => void;
}

export const TutorScheduleView: React.FC<TutorScheduleViewProps> = ({
  tutorId,
  tutorName,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [subjects, setSubjects] = useState<Array<{id: string, name: string}>>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchTimeSlots();
  }, [tutorId, selectedDate]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject:subjects (id, name)
        `)
        .eq('tutor_id', tutorId)
        .eq('is_active', true);

      if (error) throw error;

      const subjectList = (data || [])
        .map(item => item.subject)
        .filter(Boolean)
        .map(subject => Array.isArray(subject) ? subject[0] : subject);

      setSubjects(subjectList);
      if (subjectList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectList[0].id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const slots = await generateTutorTimeSlots(tutorId, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить доступное время",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!user?.id || !selectedSubject) {
      toast({
        title: "Ошибка",
        description: "Необходимо выбрать предмет и войти в систему",
        variant: "destructive"
      });
      return;
    }

    setBookingSlot(slot.slot_id);

    try {
      // Создаем запрос на занятие (pending)
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          subject_id: selectedSubject,
          requested_date: formattedDate,
          requested_start_time: slot.start_time,
          requested_end_time: slot.end_time,
          status: 'pending'
        })
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create lesson request');
      }

      toast({
        title: "Заявка отправлена",
        description: "Ожидайте подтверждения репетитора",
      });

      // Обновляем слоты и закрываем модалку
      fetchTimeSlots();
      onClose?.();
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие",
        variant: "destructive"
      });
    } finally {
      setBookingSlot(null);
    }
  };

  const availableSlots = timeSlots.filter(slot => slot.is_available);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Предмет</label>
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
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-80">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ru}
              disabled={(date) => date < new Date()}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {format(selectedDate, 'EEEE, d MMMM', { locale: ru })}
                </span>
                <Badge variant="outline">
                  {availableSlots.length} свободных слотов
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Нет свободных слотов на эту дату</p>
                  <p className="text-sm">Попробуйте выбрать другой день</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSlots.map((slot) => (
                    <Card 
                      key={slot.slot_id} 
                      className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                            </span>
                          </div>
                          <Badge variant="secondary">
                            Свободно
                          </Badge>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleBookSlot(slot)}
                          disabled={bookingSlot === slot.slot_id || !selectedSubject}
                        >
                          {bookingSlot === slot.slot_id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Бронирование...
                            </>
                          ) : (
                            'Забронировать'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
