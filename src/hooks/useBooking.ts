
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lesson } from "@/types/lesson";
import { TimeSlot } from "./useTutorSlots";
import { ensureSingleObject } from "@/utils/supabaseUtils";

export const useBooking = (setLessons?: React.Dispatch<React.SetStateAction<Lesson[]>>, lessons?: Lesson[]) => {
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBookSlot = async (slot: TimeSlot, date: Date, subjectId: string) => {
    try {
      setBookingSlot(slot.id);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему.",
          variant: "destructive"
        });
        return;
      }
      
      if (!subjectId) {
        // Get student's subjects with this tutor if no subject is provided
        const { data: subjectData, error: subjectError } = await supabase
          .from('student_requests')
          .select(`
            subject_id,
            subject:subjects(id, name)
          `)
          .eq('student_id', userData.user.id)
          .eq('tutor_id', slot.tutorId)
          .eq('status', 'accepted')
          .maybeSingle();
          
        if (subjectError) throw subjectError;
        
        if (!subjectData || !subjectData.subject_id) {
          toast({
            title: "Ошибка",
            description: "Не удалось определить предмет для занятия.",
            variant: "destructive"
          });
          return;
        }
        
        subjectId = subjectData.subject_id;
      }
      
      // Format date for the database
      const lessonDate = format(date, 'yyyy-MM-dd');
      const timeStr = slot.startTime; // Format: HH:MM:SS
      
      // Create a new lesson directly with Supabase
      const { data: lessonResult, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          student_id: userData.user.id,
          tutor_id: slot.tutorId,
          subject_id: subjectId,
          start_time: new Date(`${lessonDate}T${slot.startTime}`).toISOString(),
          end_time: new Date(`${lessonDate}T${slot.endTime}`).toISOString(),
          status: "upcoming"
        })
        .select(`
          id, 
          subject_id,
          subjects:subject_id (id, name)
        `)
        .single();
      
      if (lessonError) throw lessonError;
      
      if (lessonResult) {
        // Add the new lesson to the list if we have access to the lessons state
        if (setLessons && lessons) {
          // Convert start_time to date and time fields for compatibility with Lesson type
          const startDate = new Date(`${lessonDate}T${slot.startTime}`);
          
          const newLesson: Lesson = {
            id: lessonResult.id,
            tutor_id: slot.tutorId,
            student_id: userData.user.id,
            subject_id: subjectId,
            date: lessonDate,
            time: slot.startTime,
            duration: calculateDuration(slot.startTime, slot.endTime),
            status: "upcoming",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subject: {
              id: subjectId,
              name: ensureSingleObject(lessonResult.subjects).name || ""
            }
          };
          
          setLessons([...lessons, newLesson]);
        }
        
        toast({
          title: "Успешно",
          description: "Занятие успешно забронировано.",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error booking slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
      return false;
    } finally {
      setBookingSlot(null);
    }
  };
  
  // Helper function to calculate duration in minutes between two time strings (HH:MM:SS)
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / 60000); // Convert ms to minutes
  };

  return {
    bookingSlot,
    handleBookSlot
  };
};
