
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";
import { AvailableSlots } from "./AvailableSlots";
import { LessonsList } from "./LessonsList";
import { Lesson } from "@/types/lesson";

interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  tutorName?: string;
}

interface ScheduleContentProps {
  date: Date | undefined;
  selectedTutorId: string;
  loading: boolean;
  availableSlots: TimeSlot[];
  lessons: Lesson[];
  bookingSlot: string | null;
  onBookSlot: (slot: TimeSlot) => void;
}

export const ScheduleContent = ({
  date,
  selectedTutorId,
  loading,
  availableSlots,
  lessons,
  bookingSlot,
  onBookSlot
}: ScheduleContentProps) => {
  return (
    <Card className="md:col-span-2">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4">
          {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8" />
          </div>
        ) : (
          <>
            {/* Available slots section */}
            {selectedTutorId && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Доступное время для записи:</h4>
                <AvailableSlots 
                  slots={availableSlots} 
                  bookingSlot={bookingSlot} 
                  onBookSlot={onBookSlot}
                  tutorId={selectedTutorId}
                  date={date}
                  selectedSubjectId=""  // Добавляем пустой идентификатор предмета
                />
              </div>
            )}
            
            {/* Scheduled lessons section */}
            <div>
              <h4 className="font-medium mb-2">Запланированные занятия:</h4>
              <LessonsList lessons={lessons} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
