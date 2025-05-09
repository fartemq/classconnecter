
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  tutorName?: string;
}

export interface AvailableSlotsProps {
  slots?: TimeSlot[];
  bookingSlot?: string | null;
  onBookSlot?: (slot: TimeSlot) => void;
  // Добавляем обязательные свойства из ошибки
  tutorId?: string;
  date?: Date;
  selectedSubjectId?: string;
}

export const AvailableSlots = ({ 
  slots = [], 
  bookingSlot = null, 
  onBookSlot = () => {},
  tutorId,
  date,
  selectedSubjectId
}: AvailableSlotsProps) => {
  const [internalSlots, setInternalSlots] = useState<TimeSlot[]>(slots);
  const [loading, setLoading] = useState(slots.length === 0 && !!tutorId && !!date);
  const [processingSlot, setProcessingSlot] = useState<string | null>(bookingSlot);
  const { toast } = useToast();
  
  useEffect(() => {
    if (tutorId && date && internalSlots.length === 0) {
      fetchAvailableSlots();
    }
  }, [tutorId, date, selectedSubjectId]);
  
  const fetchAvailableSlots = async () => {
    if (!tutorId || !date) return;
    
    setLoading(true);
    try {
      // Get day of week (1-7, where 1 is Monday)
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      
      const { data, error } = await supabase
        .from('tutor_schedule')
        .select(`
          id,
          tutor_id,
          day_of_week,
          start_time,
          end_time,
          is_available
        `)
        .eq('tutor_id', tutorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const timeSlots: TimeSlot[] = data.map(slot => ({
          id: slot.id,
          tutorId: slot.tutor_id,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          isAvailable: slot.is_available
        }));
        setInternalSlots(timeSlots);
      } else {
        // If no real slots are available, create some dummy slots for demo purposes
        const dummySlots: TimeSlot[] = [];
        const startHour = 9;
        const endHour = 18;
        
        for (let hour = startHour; hour < endHour; hour++) {
          dummySlots.push({
            id: `slot-${hour}`,
            tutorId: tutorId,
            dayOfWeek: dayOfWeek,
            startTime: `${hour}:00:00`,
            endTime: `${hour + 1}:00:00`,
            isAvailable: Math.random() > 0.3 // 70% chance to be available
          });
        }
        
        setInternalSlots(dummySlots);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить доступное время",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookSlot = (slot: TimeSlot) => {
    setProcessingSlot(slot.id);
    
    // For demo purposes, simulate booking after a delay
    setTimeout(() => {
      onBookSlot(slot);
      setProcessingSlot(null);
      
      toast({
        title: "Успешно",
        description: "Занятие успешно забронировано",
      });
      
      // Remove the booked slot from available slots
      setInternalSlots(prevSlots => 
        prevSlots.map(s => 
          s.id === slot.id ? { ...s, isAvailable: false } : s
        )
      );
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8" />
      </div>
    );
  }
  
  if (internalSlots.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">
          Нет доступного времени для выбранной даты
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Доступное время:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {internalSlots.map(slot => (
          <Button
            key={slot.id}
            variant="outline"
            className="py-2 h-auto"
            onClick={() => handleBookSlot(slot)}
            disabled={processingSlot === slot.id || !slot.isAvailable}
          >
            {processingSlot === slot.id ? (
              <Loader className="w-4 h-4 mr-2" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
          </Button>
        ))}
      </div>
    </div>
  );
};
