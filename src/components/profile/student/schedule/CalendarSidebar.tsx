
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";
import { ru } from "date-fns/locale";

export interface CalendarSidebarProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  selectedTutorId: string;
  setSelectedTutorId: (id: string) => void;
  tutors: Array<{id: string; name: string}>;
}

export const CalendarSidebar = ({
  date,
  setDate,
  selectedTutorId,
  setSelectedTutorId,
  tutors
}: CalendarSidebarProps) => {
  return (
    <Card className="md:col-span-1">
      <CardContent className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Выберите репетитора:</label>
          <Select
            value={selectedTutorId}
            onValueChange={setSelectedTutorId}
            disabled={tutors.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={tutors.length === 0 ? "Нет доступных репетиторов" : "Выберите репетитора"} />
            </SelectTrigger>
            <SelectContent>
              {tutors.map(tutor => (
                <SelectItem key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="border rounded-md pointer-events-auto"
          locale={ru}
          disabled={(day) => day < new Date() || day > addDays(new Date(), 30)}
        />
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <Badge className="bg-blue-100 text-blue-800 mr-2">•</Badge>
            <span className="text-sm">Запланировано</span>
          </div>
          <div className="flex items-center">
            <Badge className="bg-green-100 text-green-800 mr-2">•</Badge>
            <span className="text-sm">Завершено</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
