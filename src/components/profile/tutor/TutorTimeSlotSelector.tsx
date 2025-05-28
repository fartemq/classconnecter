
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Plus, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}

interface TutorTimeSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  studentName: string;
  subject: string;
}

export const TutorTimeSlotSelector: React.FC<TutorTimeSlotSelectorProps> = ({
  isOpen,
  onClose,
  requestId,
  studentName,
  subject
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTimeSlot = () => {
    const tomorrow = addDays(new Date(), 1);
    setTimeSlots([...timeSlots, {
      date: format(tomorrow, 'yyyy-MM-dd'),
      start_time: '10:00',
      end_time: '11:00'
    }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleSubmit = async () => {
    if (timeSlots.length === 0) {
      toast({
        title: "Добавьте время",
        description: "Предложите хотя бы один вариант времени",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Сохраняем предложенные слоты времени в базе данных
      const { error } = await supabase
        .from('lesson_requests')
        .update({
          status: 'time_slots_proposed',
          tutor_response: JSON.stringify(timeSlots),
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Время предложено",
        description: "Студент получит уведомление с вариантами времени"
      });

      onClose();
      setTimeSlots([]);
    } catch (error) {
      console.error('Error proposing time slots:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось предложить время",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Предложите время для занятия</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Студент: {studentName} • Предмет: {subject}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Доступные варианты времени</Label>
            <Button onClick={addTimeSlot} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Добавить время
            </Button>
          </div>

          {timeSlots.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">
                  Добавьте варианты времени для занятия
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Дата</Label>
                          <div className="relative">
                            <Input
                              type="date"
                              value={slot.date}
                              onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                              min={format(new Date(), 'yyyy-MM-dd')}
                              className="pl-10"
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Начало</Label>
                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Окончание</Label>
                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || timeSlots.length === 0}
              className="flex-1"
            >
              {isLoading && <Loader size="sm" className="mr-2" />}
              Предложить время
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
