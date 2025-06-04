
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
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
  const [message, setMessage] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBookingComplete = () => {
    onBookingComplete?.();
    onClose();
    setMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Запись на занятие к {tutor.first_name} {tutor.last_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите время из доступного расписания репетитора
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Используем только компонент, работающий по расписанию */}
          <TutorScheduleView 
            tutorId={tutor.id} 
            onClose={handleBookingComplete}
          />

          {message && (
            <div className="space-y-2">
              <Label>Дополнительное сообщение</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Дополнительная информация для репетитора..."
                rows={3}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
