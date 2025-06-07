
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Calendar as CalendarIcon, User } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { BookLessonDialog } from "./BookLessonDialog";
import { useToast } from "@/hooks/use-toast";

interface TutorScheduleViewProps {
  tutorId?: string;
  tutorName?: string;
  onClose?: () => void;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

interface Subject {
  id: string;
  name: string;
}

export const TutorScheduleView: React.FC<TutorScheduleViewProps> = ({ 
  tutorId, 
  tutorName = "Репетитор",
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (tutorId) {
      fetchTutorSubjects();
    }
  }, [tutorId]);

  useEffect(() => {
    if (tutorId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [tutorId, selectedDate]);

  const fetchTutorSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject:subjects(id, name)
        `)
        .eq('tutor_id', tutorId)
        .eq('is_active', true);

      if (error) throw error;

      const subjectList = data
        ?.map(item => item.subject)
        .filter(Boolean)
        .map(subject => Array.isArray(subject) ? subject[0] : subject) as Subject[];

      setSubjects(subjectList || []);
    } catch (error) {
      console.error('Error fetching tutor subjects:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!tutorId || !selectedDate) return;
    
    setIsLoading(true);
    try {
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Получаем расписание репетитора на выбранный день недели
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('tutor_schedule')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .order('start_time');
        
      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError);
        setAvailableSlots([]);
        return;
      }
      
      if (!scheduleData || scheduleData.length === 0) {
        setAvailableSlots([]);
        return;
      }
      
      // Проверяем исключения на выбранную дату
      const { data: exceptions, error: exceptionsError } = await supabase
        .from('tutor_schedule_exceptions')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('date', formattedDate)
        .eq('is_full_day', true);
        
      if (exceptionsError) {
        console.error('Error fetching exceptions:', exceptionsError);
      }
      
      // Если есть исключение на весь день, слоты недоступны
      if (exceptions && exceptions.length > 0) {
        setAvailableSlots([]);
        return;
      }
      
      // Получаем уже забронированные занятия на эту дату
      const { data: existingLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('start_time, end_time')
        .eq('tutor_id', tutorId)
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lt('start_time', `${formattedDate}T23:59:59`)
        .in('status', ['pending', 'confirmed', 'upcoming']);
        
      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }
      
      // Фильтруем доступные слоты, исключая уже забронированные
      const freeSlots = scheduleData.filter(slot => {
        const slotStartTime = `${formattedDate}T${slot.start_time}`;
        
        return !existingLessons?.some(lesson => 
          lesson.start_time === slotStartTime
        );
      });
      
      setAvailableSlots(freeSlots);
    } catch (error) {
      console.error('Error in fetchAvailableSlots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Сегодня';
    if (isTomorrow(date)) return 'Завтра';
    return format(date, 'dd MMMM', { locale: ru });
  };

  const isDateAvailable = (date: Date) => {
    // Не позволяем выбирать прошедшие даты
    return date >= new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Выберите время для занятия</h3>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Календарь для выбора даты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Выберите дату</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Доступные временные слоты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>
                Доступное время - {getDateLabel(selectedDate)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Нет доступного времени</p>
                <p className="text-sm">на выбранную дату</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map(slot => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="py-3 h-auto hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => handleSlotSelect(slot)}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог бронирования */}
      {selectedSlot && (
        <BookLessonDialog
          isOpen={bookingDialogOpen}
          onClose={() => {
            setBookingDialogOpen(false);
            setSelectedSlot(null);
          }}
          tutorId={tutorId!}
          tutorName={tutorName}
          date={selectedDate}
          startTime={selectedSlot.start_time}
          endTime={selectedSlot.end_time}
          subjects={subjects}
        />
      )}
    </div>
  );
};
