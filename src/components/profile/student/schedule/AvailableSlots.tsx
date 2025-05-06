
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  tutorName?: string;
}

interface AvailableSlotsProps {
  slots: TimeSlot[];
  bookingSlot: string | null;
  onBookSlot: (slot: TimeSlot) => void;
}

export const AvailableSlots = ({ slots, bookingSlot, onBookSlot }: AvailableSlotsProps) => {
  if (slots.length === 0) {
    return (
      <p className="text-gray-500">
        Нет доступного времени для выбранной даты
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map(slot => (
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
  );
};
