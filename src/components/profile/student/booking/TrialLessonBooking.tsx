
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TutorScheduleView } from "../schedule/TutorScheduleView";

interface TrialLessonBookingProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const TrialLessonBooking: React.FC<TrialLessonBookingProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      loadTutorSubjects();
    }
  }, [isOpen, tutor.id]);

  const loadTutorSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          id,
          subject_id,
          hourly_rate,
          subjects:subject_id (name)
        `)
        .eq('tutor_id', tutor.id)
        .eq('is_active', true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleBookingComplete = () => {
    toast({
      title: "Пробное занятие забронировано",
      description: "Занятие успешно забронировано по расписанию репетитора.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Пробное занятие с {tutor.first_name} {tutor.last_name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите время из расписания репетитора
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-800 mb-1">Пробное занятие:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Бронирование только по расписанию репетитора</li>
              <li>• Доступно только в установленные репетитором часы</li>
              <li>• Требует подтверждения репетитора</li>
            </ul>
          </div>

          {/* Используем TutorScheduleView для строгого соблюдения расписания */}
          <TutorScheduleView 
            tutorId={tutor.id} 
            onClose={handleBookingComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
