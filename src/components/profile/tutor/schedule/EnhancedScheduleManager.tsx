
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, Eye } from "lucide-react";
import { generateTutorTimeSlots } from "@/services/lesson/timeSlotsService";

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  lesson_duration: number;
  break_duration: number;
  is_available: boolean;
}

interface GeneratedSlot {
  slot_id: string;
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

export const EnhancedScheduleManager = () => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [previewSlots, setPreviewSlots] = useState<GeneratedSlot[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    lesson_duration: 60,
    break_duration: 15
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
      
      const formattedSlots = (data || []).map(slot => ({
        ...slot,
        lesson_duration: slot.lesson_duration || 60,
        break_duration: slot.break_duration || 15
      }));
      
      setScheduleSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить расписание",
        variant: "destructive"
      });
    }
  };

  const generatePreview = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get next occurrence of the selected day
      const today = new Date();
      const targetDay = newSlot.day_of_week === 7 ? 0 : newSlot.day_of_week; // Convert Sunday
      const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (daysUntilTarget || 7));
      
      // Temporarily create schedule entry for preview
      const tempSlot = {
        tutor_id: user.id,
        day_of_week: newSlot.day_of_week,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        lesson_duration: newSlot.lesson_duration,
        break_duration: newSlot.break_duration,
        is_available: true
      };

      // Insert temporary slot
      const { data: insertedSlot, error: insertError } = await supabase
        .from('tutor_schedule')
        .insert(tempSlot)
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate slots for preview
      const slots = await generateTutorTimeSlots(user.id, targetDate);
      setPreviewSlots(slots);
      setShowPreview(true);

      // Remove temporary slot
      await supabase
        .from('tutor_schedule')
        .delete()
        .eq('id', insertedSlot.id);

    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать превью слотов",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addScheduleSlot = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (newSlot.start_time >= newSlot.end_time) {
        toast({
          title: "Некорректное время",
          description: "Время начала должно быть раньше времени окончания",
          variant: "destructive"
        });
        return;
      }

      const totalMinutes = (new Date(`2000-01-01T${newSlot.end_time}`).getTime() - 
                           new Date(`2000-01-01T${newSlot.start_time}`).getTime()) / 60000;
      
      if (newSlot.lesson_duration > totalMinutes) {
        toast({
          title: "Некорректная длительность",
          description: "Длительность урока превышает доступное время",
          variant: "destructive"
        });
        return;
      }

      // Check for overlaps
      const overlapping = scheduleSlots.some(slot => 
        slot.day_of_week === newSlot.day_of_week && 
        ((newSlot.start_time >= slot.start_time && newSlot.start_time < slot.end_time) || 
         (newSlot.end_time > slot.start_time && newSlot.end_time <= slot.end_time) ||
         (newSlot.start_time <= slot.start_time && newSlot.end_time >= slot.end_time))
      );

      if (overlapping) {
        toast({
          title: "Перекрытие времени",
          description: "Этот временной интервал перекрывается с уже существующим",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('tutor_schedule')
        .insert({
          tutor_id: user?.id,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          lesson_duration: newSlot.lesson_duration,
          break_duration: newSlot.break_duration,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Слот добавлен",
        description: "Расписание успешно обновлено"
      });

      fetchSchedule();
      setShowPreview(false);
    } catch (error) {
      console.error('Error adding schedule slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить слот",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
        description: "Временной слот удален из расписания"
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

  const formatTimeSlots = (slots: GeneratedSlot[]) => {
    return slots.map((slot, index) => (
      <Badge 
        key={index} 
        variant={slot.is_available ? "secondary" : "destructive"}
        className="mr-2 mb-2"
      >
        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
      </Badge>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Управление расписанием</CardTitle>
          <p className="text-sm text-muted-foreground">
            Настройте свое рабочее время и автоматически генерируйте слоты для занятий
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>День недели</Label>
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
              </div>

              <div className="space-y-2">
                <Label>Начало</Label>
                <Input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Окончание</Label>
                <Input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Длительность урока (мин)</Label>
                <Input
                  type="number"
                  min="15"
                  max="180"
                  step="15"
                  value={newSlot.lesson_duration}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, lesson_duration: parseInt(e.target.value) || 60 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Перерыв (мин)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={newSlot.break_duration}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 15 }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="invisible">Действия</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePreview}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Превью
                  </Button>
                  <Button onClick={addScheduleSlot} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </div>
            </div>

            {showPreview && previewSlots.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Превью слотов для {getDayName(newSlot.day_of_week)}:
                </h4>
                <div className="flex flex-wrap">
                  {formatTimeSlots(previewSlots)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Будет создано {previewSlots.length} слотов
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущее расписание</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Расписание пустое</p>
              <p className="text-sm">Добавьте временные слоты для начала работы</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleSlots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{getDayName(slot.day_of_week)}</span>
                      <span className="text-muted-foreground">
                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Урок: {slot.lesson_duration} мин</span>
                      <span>Перерыв: {slot.break_duration} мин</span>
                    </div>
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
