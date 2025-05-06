
import React from "react";
import { Button } from "@/components/ui/button";

interface TutorScheduleFooterProps {
  tutorName: string;
  onClose: () => void;
}

export const TutorScheduleFooter = ({ tutorName, onClose }: TutorScheduleFooterProps) => {
  return (
    <div className="flex justify-between">
      <p className="text-sm text-gray-500">
        Репетитор: {tutorName}
      </p>
      <Button variant="outline" onClick={onClose}>
        Закрыть
      </Button>
    </div>
  );
};
