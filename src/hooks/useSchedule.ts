
import { useState, useEffect } from "react";
import { useStudentTutors } from "./useStudentTutors";
import { useTutorSlots } from "./useTutorSlots";
import { useLessons } from "./useLessons";
import { useBooking } from "./useBooking";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useSchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  
  const { tutors } = useStudentTutors();
  const { availableSlots, loading, refreshSlots } = useTutorSlots(selectedTutorId, date);
  const { lessons, setLessons, refreshLessons, isLoading: lessonsLoading } = useLessons(date);
  const { bookingSlot, handleBookSlot } = useBooking(setLessons, lessons);

  // Initialize selectedTutorId when tutors are loaded
  useEffect(() => {
    if (selectedTutorId === "" && tutors.length > 0) {
      setSelectedTutorId(tutors[0].id);
    }
  }, [tutors, selectedTutorId]);

  // Set up realtime updates for schedule changes
  useEffect(() => {
    if (!realtimeEnabled && selectedTutorId) {
      const channel = supabase
        .channel('schedule-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'tutor_schedule',
          filter: `tutor_id=eq.${selectedTutorId}`
        }, () => {
          refreshSlots();
          toast({
            title: "Расписание обновлено",
            description: "Преподаватель обновил свое расписание",
          });
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'lessons',
          filter: `tutor_id=eq.${selectedTutorId}`
        }, () => {
          refreshLessons();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons'
        }, (payload) => {
          if (payload.new && (payload.new.tutor_id === selectedTutorId || payload.new.student_id === payload.new.student_id)) {
            refreshLessons();
            
            if (payload.new.status === 'confirmed') {
              toast({
                title: "Занятие подтверждено",
                description: "Преподаватель подтвердил занятие",
              });
            } else if (payload.new.status === 'canceled') {
              toast({
                title: "Занятие отменено",
                description: "Занятие было отменено",
                variant: "destructive"
              });
            }
          }
        })
        .subscribe();
      
      setRealtimeEnabled(true);
      
      return () => {
        supabase.removeChannel(channel);
        setRealtimeEnabled(false);
      };
    }
  }, [selectedTutorId, realtimeEnabled, refreshSlots, refreshLessons]);

  return {
    date,
    setDate,
    selectedTutorId,
    setSelectedTutorId,
    tutors,
    availableSlots,
    lessons,
    loading: loading || lessonsLoading,
    bookingSlot,
    handleBookSlot: (slot: Parameters<typeof handleBookSlot>[0]) => {
      if (date) {
        return handleBookSlot(slot, date, "");
      }
      return Promise.resolve(false);
    }
  };
};

export * from "./useTutorSlots";
export * from "./useStudentTutors";
