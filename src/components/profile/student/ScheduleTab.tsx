
import React from "react";
import { CalendarSidebar } from "./schedule/CalendarSidebar";
import { ScheduleContent } from "./schedule/ScheduleContent";
import { useSchedule } from "@/hooks/useSchedule";

export const ScheduleTab = () => {
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Расписание занятий</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CalendarSidebar
          date={date}
          setDate={setDate}
          selectedTutorId={selectedTutorId}
          setSelectedTutorId={setSelectedTutorId}
          tutors={tutors}
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
