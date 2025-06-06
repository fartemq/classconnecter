
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 7, label: 'Воскресенье' },
];

export const ScheduleManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00'
  });

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id]);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_schedule')
        .select('*')
        .eq('tutor_id', user?.id)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setScheduleSlots(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить расписание",
        variant: "destructive"
      });
    }
  };

  const addScheduleSlot = async () => {
    try {
      const { error } = await supabase
        .from('tutor_schedule')
        .insert({
          tutor_id: user?.id,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Слот добавлен",
        description: "Новый временной слот успешно добавлен"
      });

      fetchSchedule();
    } catch (error) {
      console.error('Error adding schedule slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить слот",
        variant: "destructive"
      });
    }
  };

  const removeScheduleSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('tutor_schedule')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Слот удален",
        description: "Временной слот удален"
      });

      fetchSchedule();
    } catch (error) {
      console.error('Error removing schedule slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить слот",
        variant: "destructive"
      });
    }
  };

  const getDayName = (dayNumber: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayNumber)?.label || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление расписанием</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select 
                value={newSlot.day_of_week.toString()} 
                onValueChange={(value) => setNewSlot(prev => ({ ...prev, day_of_week: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map(day => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              />

              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                className="px-3 py-2 border rounded-md"
              />

              <Button onClick={addScheduleSlot}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущее расписание</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleSlots.length === 0 ? (
            <p className="text-gray-500">Расписание пустое. Добавьте временные слоты.</p>
          ) : (
            <div className="space-y-2">
              {scheduleSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{getDayName(slot.day_of_week)}</span>
                    <span className="ml-4">{slot.start_time} - {slot.end_time}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScheduleSlot(slot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
