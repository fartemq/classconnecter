
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ru } from "date-fns/locale";

interface TutorCalendarProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const TutorCalendar = ({ date, onDateChange }: TutorCalendarProps) => {
  return (
    <div className="md:w-1/2">
      <h3 className="font-medium mb-2">Выберите дату:</h3>
      <div className="border rounded-lg p-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && onDateChange(newDate)}
          className="rounded-md border"
          locale={ru}
          disabled={{ before: new Date() }}
        />
      </div>
    </div>
  );
};
