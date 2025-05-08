
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarSidebar } from "./schedule/CalendarSidebar";
import { ScheduleContent } from "./schedule/ScheduleContent";
import { useSchedule } from "@/hooks/useSchedule";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const ScheduleTab = () => {
  const [searchParams] = useSearchParams();
  const tutorIdParam = searchParams.get('tutorId');
  const { user } = useAuth();

  const {
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
  } = useSchedule();

  // If tutorId is provided in query params, select that tutor
  useEffect(() => {
    if (tutorIdParam && tutorIdParam !== selectedTutorId) {
      setSelectedTutorId(tutorIdParam);
    }
  }, [tutorIdParam, setSelectedTutorId, selectedTutorId]);
  
  // Set up notifications for lesson updates
  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('lesson-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `student_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast({
            title: "Новое занятие",
            description: "Занятие было успешно добавлено в ваше расписание",
          });
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'confirmed') {
          toast({
            title: "Занятие подтверждено",
            description: "Репетитор подтвердил ваше занятие",
          });
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'canceled') {
          toast({
            title: "Занятие отменено",
            description: "Ваше занятие было отменено",
            variant: "destructive"
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Расписание занятий</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CalendarSidebar
          date={date}
          setDate={setDate}
          selectedTutorId={selectedTutorId}
          setSelectedTutorId={setSelectedTutorId}
          tutors={tutors.map(tutor => ({
            id: tutor.id,
            name: `${tutor.first_name} ${tutor.last_name || ''}`
          }))}
        />
        
        <ScheduleContent
          date={date}
          selectedTutorId={selectedTutorId}
          loading={loading}
          availableSlots={availableSlots}
          lessons={lessons}
          bookingSlot={bookingSlot}
          onBookSlot={handleBookSlot}
        />
      </div>
    </div>
  );
};
