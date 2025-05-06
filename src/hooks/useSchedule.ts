
import { useState } from "react";
import { useStudentTutors } from "./useStudentTutors";
import { useTutorSlots } from "./useTutorSlots";
import { useLessons } from "./useLessons";
import { useBooking } from "./useBooking";

export const useSchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  
  const { tutors } = useStudentTutors();
  const { availableSlots, loading } = useTutorSlots(selectedTutorId, date);
  const { lessons, setLessons } = useLessons(date);
  const { bookingSlot, handleBookSlot } = useBooking(setLessons, lessons);

  // Initialize selectedTutorId when tutors are loaded
  if (selectedTutorId === "" && tutors.length > 0) {
    setSelectedTutorId(tutors[0].id);
  }

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
