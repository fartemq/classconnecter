
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TutorScheduleView } from "./schedule/TutorScheduleView";

interface TutorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    subjects?: any[];
  };
  onBookingComplete?: () => void;
}

export const TutorBookingModal: React.FC<TutorBookingModalProps> = ({
  isOpen,
  onClose,
  tutor,
  onBookingComplete
}) => {
  const handleBookingComplete = () => {
    onBookingComplete?.();
    onClose();
  };

  const tutorName = `${tutor.first_name} ${tutor.last_name || ''}`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Запись на занятие к {tutorName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите удобное время из расписания репетитора
          </p>
        </DialogHeader>

        <TutorScheduleView 
          tutorId={tutor.id}
          tutorName={tutorName}
          onClose={handleBookingComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
