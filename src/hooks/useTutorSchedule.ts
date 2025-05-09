
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { TimeSlot } from "@/types/tutor";

export const useTutorSchedule = (tutorId: string) => {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tutor_schedule")
        .select("*")
        .eq("tutor_id", tutorId);

      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(item => ({
          id: item.id as string,
          tutorId: item.tutor_id as string,
          dayOfWeek: item.day_of_week as number,
          startTime: item.start_time as string,
          endTime: item.end_time as string,
          isAvailable: item.is_available as boolean
        }));

        setSchedule(formattedData);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить расписание",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const addTimeSlot = async (dayOfWeek: number, startTime: string, endTime: string) => {
    try {
      setSaving(true);
      
      // Validate time range
      if (startTime >= endTime) {
        toast({
          title: "Некорректное время",
          description: "Время начала должно быть раньше времени окончания",
          variant: "destructive",
        });
        return false;
      }

      // Check if overlapping with existing slots
      const overlapping = schedule.some(slot => 
        slot.dayOfWeek === dayOfWeek && 
        ((startTime >= slot.startTime && startTime < slot.endTime) || 
         (endTime > slot.startTime && endTime <= slot.endTime) ||
         (startTime <= slot.startTime && endTime >= slot.endTime))
      );

      if (overlapping) {
        toast({
          title: "Перекрытие времени",
          description: "Этот временной интервал перекрывается с уже существующим",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase
        .from("tutor_schedule")
        .insert({
          tutor_id: tutorId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newSlot: TimeSlot = {
          id: data[0].id,
          tutorId: data[0].tutor_id,
          dayOfWeek: data[0].day_of_week,
          startTime: data[0].start_time,
          endTime: data[0].end_time,
          isAvailable: data[0].is_available
        };

        setSchedule([...schedule, newSlot]);
        
        toast({
          title: "Расписание обновлено",
          description: "Новый временной слот успешно добавлен"
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить временной слот",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleSlotAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tutor_schedule")
        .update({ is_available: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setSchedule(schedule.map(slot => 
        slot.id === id ? { ...slot, isAvailable: !currentStatus } : slot
      ));
      
      toast({
        title: "Статус обновлен",
        description: `Слот ${!currentStatus ? "доступен" : "заблокирован"} для записи`
      });
      return true;
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус доступности",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tutor_schedule")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setSchedule(schedule.filter(slot => slot.id !== id));
      
      toast({
        title: "Слот удален",
        description: "Временной слот успешно удален из расписания"
      });
      return true;
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить временной слот",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    schedule,
    loading,
    saving,
    fetchSchedule,
    addTimeSlot,
    toggleSlotAvailability,
    deleteTimeSlot
  };
};
