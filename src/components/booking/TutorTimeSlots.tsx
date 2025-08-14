import React from "react";
import { EnhancedTutorTimeSlots } from "./EnhancedTutorTimeSlots";

interface TutorTimeSlotsProps {
  tutorId: string;
  selectedDate: Date;
  selectedSubjectId: string;
  subjectName: string;
  hourlyRate: number;
}

export const TutorTimeSlots: React.FC<TutorTimeSlotsProps> = (props) => {
  return <EnhancedTutorTimeSlots {...props} />;
};