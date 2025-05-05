
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TutorSchedule } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMinutes } from "date-fns";
import { ru } from "date-fns/locale";

interface AdvancedScheduleTabProps {
  tutorId: string;
}

const dayNames = [
  "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
];

const timeSlots = [];
for (let hour = 8; hour < 22; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    timeSlots.push(timeString);
  }
}

export const AdvancedScheduleTab = ({ tutorId }: AdvancedScheduleTabProps) => {
  const [schedule, setSchedule] = useState<TutorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday as default
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [tutorId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tutor_schedule")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        tutorId: item.tutor_id,
        dayOfWeek: item.day_of_week,
        startTime: item.start_time,
        endTime: item.end_time,
        isAvailable: item.is_available
      }));

      setSchedule(formattedData);
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
  };

  const handleAddTimeSlot = async () => {
    try {
      setSaving(true);
      
      // Validate time range
      if (startTime >= endTime) {
        toast({
          title: "Некорректное время",
          description: "Время начала должно быть раньше времени окончания",
          variant: "destructive",
        });
        return;
      }

      // Check if overlapping with existing slots
      const overlapping = schedule.some(slot => 
        slot.dayOfWeek === selectedDay && 
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
        return;
      }

      const { data, error } = await supabase
        .from("tutor_schedule")
        .insert({
          tutor_id: tutorId,
          day_of_week: selectedDay,
          start_time: startTime,
          end_time: endTime,
          is_available: true
        })
        .select();

      if (error) throw error;

      const newSlot = {
        id: data[0].id,
        tutorId,
        dayOfWeek: selectedDay,
        startTime,
        endTime,
        isAvailable: true
      };

      setSchedule([...schedule, newSlot]);
      
      toast({
        title: "Расписание обновлено",
        description: "Новый временной слот успешно добавлен"
      });
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить временной слот",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
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
    } catch (error) {
      console.error("Error toggling availability:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус доступности",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTimeSlot = async (id: string) => {
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
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить временной слот",
        variant: "destructive",
      });
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const startDate = new Date();
    const [startHours, startMinutes] = start.split(':').map(Number);
    startDate.setHours(startHours, startMinutes);
    
    const endDate = new Date();
    const [endHours, endMinutes] = end.split(':').map(Number);
    endDate.setHours(endHours, endMinutes);
    
    return `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Расписание занятий</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Добавить временной слот</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">День недели</label>
              <Select
                value={selectedDay.toString()}
                onValueChange={(value) => setSelectedDay(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите день" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Время начала</label>
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Время окончания</label>
              <Select
                value={endTime}
                onValueChange={setEndTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="mt-4" 
            onClick={handleAddTimeSlot} 
            disabled={saving}
          >
            {saving ? <Loader size="sm" className="mr-2" /> : null}
            {saving ? "Добавление..." : "Добавить временной слот"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {dayNames.map((dayName, dayIndex) => {
            const dayNumber = dayIndex + 1;
            const daySlots = schedule.filter(slot => slot.dayOfWeek === dayNumber);
            
            return (
              <Card key={dayNumber} className={daySlots.length > 0 ? "border-primary/20" : ""}>
                <CardHeader className="px-3 py-2 border-b bg-muted/50">
                  <CardTitle className="text-base font-medium text-center">
                    {dayName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => (
                          <div 
                            key={slot.id} 
                            className={`p-2 rounded-md text-sm relative group ${
                              slot.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {formatTimeRange(slot.startTime, slot.endTime)}
                              </span>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2">
                                <Button 
                                  size="icon"
                                  variant="outline"
                                  className="h-6 w-6"
                                  onClick={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                                >
                                  {slot.isAvailable ? 
                                    <span className="text-xs">🔒</span> : 
                                    <span className="text-xs">🔓</span>
                                  }
                                </Button>
                                <Button 
                                  size="icon"
                                  variant="destructive"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteTimeSlot(slot.id)}
                                >
                                  <span className="text-xs">✕</span>
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs mt-1 text-gray-600">
                              {slot.isAvailable ? 'Доступно' : 'Заблокировано'}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="py-4 text-center text-gray-500 text-sm">
                      Нет слотов
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
