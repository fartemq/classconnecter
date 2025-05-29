
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface AvailableTimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

export const useAvailableSlots = (tutorId: string, date: Date | undefined) => {
  const [slots, setSlots] = useState<AvailableTimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId || !date) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем день недели (1-7, где 1 = понедельник)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        const formattedDate = format(date, 'yyyy-MM-dd');

        // Получаем расписание репетитора на этот день недели
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('tutor_schedule')
          .select('*')
          .eq('tutor_id', tutorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true);

        if (scheduleError) throw scheduleError;

        if (!scheduleData || scheduleData.length === 0) {
          setSlots([]);
          return;
        }

        // Получаем уже забронированные занятия на эту дату
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('start_time, end_time')
          .eq('tutor_id', tutorId)
          .gte('start_time', `${formattedDate}T00:00:00`)
          .lte('start_time', `${formattedDate}T23:59:59`)
          .in('status', ['pending', 'confirmed']);

        if (lessonsError) throw lessonsError;

        // Фильтруем доступные слоты, исключая забронированные
        const availableSlots = scheduleData.filter(slot => {
          return !lessonsData?.some(lesson => {
            const lessonStart = new Date(lesson.start_time).toTimeString().slice(0, 5);
            const lessonEnd = new Date(lesson.end_time).toTimeString().slice(0, 5);
            return (slot.start_time < lessonEnd && slot.end_time > lessonStart);
          });
        });

        const formattedSlots: AvailableTimeSlot[] = availableSlots.map(slot => ({
          id: slot.id,
          date: formattedDate,
          start_time: slot.start_time,
          end_time: slot.end_time,
          day_of_week: slot.day_of_week
        }));

        setSlots(formattedSlots);
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [tutorId, date]);

  return { slots, loading, error };
};
