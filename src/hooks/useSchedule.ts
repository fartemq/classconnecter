
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { addDays } from "date-fns";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  start_time: string;
  end_time: string;
  status: string;
  subject_id: string | null;
  subject?: {
    name: string;
  };
  tutor?: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useSchedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch tutors
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('role', 'tutor');
          
        if (error) {
          console.error("Error fetching tutors:", error);
          return;
        }
        
        setTutors(data || []);
        
        // If there are tutors and none is selected, select the first one
        if (data && data.length > 0 && !selectedTutorId) {
          setSelectedTutorId(data[0].id);
        }
      } catch (err) {
        console.error("Error in fetchTutors:", err);
      }
    };
    
    fetchTutors();
  }, [selectedTutorId]);
  
  // Fetch slots and lessons when date or tutor changes
  useEffect(() => {
    if (!selectedTutorId) return;
    
    const fetchSlotsAndLessons = async () => {
      setLoading(true);
      try {
        // For now, let's create some dummy slots since we haven't implemented this feature yet
        const dummySlots: Slot[] = [];
        const startHour = 9;
        const endHour = 18;
        
        for (let hour = startHour; hour < endHour; hour++) {
          dummySlots.push({
            id: `slot-${hour}`,
            start_time: new Date(date).setHours(hour, 0, 0, 0).toString(),
            end_time: new Date(date).setHours(hour + 1, 0, 0, 0).toString(),
            is_available: Math.random() > 0.3 // 70% chance to be available
          });
        }
        
        setAvailableSlots(dummySlots);
        
        // Fetch actual lessons (when we implement this functionality)
        // For now, just set an empty array
        setLessons([]);
      } catch (err) {
        console.error("Error in fetchSlotsAndLessons:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlotsAndLessons();
  }, [date, selectedTutorId]);
  
  const handleBookSlot = async (slotId: string) => {
    if (!user?.id || !selectedTutorId) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    setBookingSlot(slotId);
    
    try {
      // Find the slot
      const slot = availableSlots.find(s => s.id === slotId);
      if (!slot) return;
      
      // For now, just show a success message since we haven't implemented booking yet
      setTimeout(() => {
        toast({
          title: "Успешно",
          description: "Занятие успешно забронировано",
        });
        
        // Remove the booked slot from available slots
        setAvailableSlots(prevSlots => 
          prevSlots.map(s => 
            s.id === slotId ? { ...s, is_available: false } : s
          )
        );
        
        setBookingSlot(null);
      }, 1000);
      
    } catch (err) {
      console.error("Error in handleBookSlot:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие",
        variant: "destructive"
      });
      setBookingSlot(null);
    }
  };
  
  return {
    date,
    setDate,
    selectedTutorId,
    setSelectedTutorId,
    tutors,
    availableSlots,
    lessons,
    loading,
    bookingSlot,
    handleBookSlot
  };
};
