
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Clock, CalendarDays } from "lucide-react";

interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TutorScheduleSlotsProps {
  loading: boolean;
  availableSlots: TimeSlot[];
  bookingSlot: string | null;
  onBookSlot: (slot: TimeSlot) => void;
}

export const TutorScheduleSlots = ({ 
  loading, 
  availableSlots, 
  bookingSlot, 
  onBookSlot 
}: TutorScheduleSlotsProps) => {
  return (
    <div className="border rounded-lg p-3 min-h-[180px] flex flex-col">
      {!loading && availableSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
          <CalendarDays className="h-10 w-10 mb-2 text-gray-400" />
          <p>На выбранную дату нет доступного времени.</p>
          <p className="text-sm">Пожалуйста, выберите другую дату.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          {availableSlots.map(slot => (
            <Button
              key={slot.id}
              variant="outline"
              className="py-2 h-auto"
              onClick={() => onBookSlot(slot)}
              disabled={bookingSlot === slot.id}
            >
              {bookingSlot === slot.id ? (
                <Loader className="w-4 h-4 mr-2" />
              ) : (
                <Clock className="w-4 h-4 mr-2" />
              )}
              {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
