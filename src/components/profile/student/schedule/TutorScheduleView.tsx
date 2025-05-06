
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TutorCalendar } from "./TutorCalendar";
import { TutorScheduleSlots } from "./TutorScheduleSlots";
import { TutorScheduleFooter } from "./TutorScheduleFooter";
import { TutorSubjectSelect } from "./TutorSubjectSelect";

interface TutorScheduleViewProps {
  tutorId: string;
  onClose: () => void;
}

export const TutorScheduleView = ({ tutorId, onClose }: TutorScheduleViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [tutorName, setTutorName] = useState<string>("");
  const { toast } = useToast();

  // Fetch tutor's name and subjects
  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        // Fetch tutor profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', tutorId)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          setTutorName(`${profileData.first_name} ${profileData.last_name || ''}`);
        }
        
        // Fetch subjects taught by tutor
        const { data: subjectData, error: subjectError } = await supabase
          .from('tutor_subjects')
          .select(`
            subject_id,
            subjects:subject_id (id, name)
          `)
          .eq('tutor_id', tutorId);
          
        if (subjectError) throw subjectError;
        
        if (subjectData && subjectData.length > 0) {
          const formattedSubjects = subjectData.map(item => ({
            id: item.subject_id,
            name: item.subjects.name
          }));
          
          setSubjects(formattedSubjects);
          if (formattedSubjects.length > 0) {
            setSelectedSubject(formattedSubjects[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching tutor details:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить информацию о репетиторе",
          variant: "destructive"
        });
      }
    };
    
    fetchTutorDetails();
  }, [tutorId, toast]);
  
  // Fetch tutor's available slots
  useEffect(() => {
    const fetchTutorSlots = async () => {
      if (!tutorId || !date) return;
      
      try {
        setLoading(true);
        
        // Get day of week (1-7, where 1 is Monday)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        
        const { data, error } = await supabase
          .from('tutor_schedule')
          .select(`
            id,
            tutor_id,
            day_of_week,
            start_time,
            end_time,
            is_available
          `)
          .eq('tutor_id', tutorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true);
          
        if (error) throw error;
        
        if (data) {
          setAvailableSlots(data.map(slot => ({
            id: slot.id,
            tutorId: slot.tutor_id,
            dayOfWeek: slot.day_of_week,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: slot.is_available
          })));
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error fetching tutor slots:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить доступное время репетитора.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorSlots();
  }, [tutorId, date, toast]);
  
  const handleBookSlot = async (slot: any) => {
    if (!selectedSubject) {
      toast({
        title: "Выберите предмет",
        description: "Для бронирования занятия необходимо выбрать предмет",
        variant: "destructive"
      });
      return;
    }
    
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
      
      // Format date for the database
      const lessonDate = format(date, 'yyyy-MM-dd');
      
      // Create a new lesson using our service
      const lessonData = {
        student_id: userData.user.id,
        tutor_id: slot.tutorId,
        subject_id: selectedSubject,
        date: lessonDate,
        time: slot.startTime,
        duration: 60, // Default duration, could be calculated from start/end time
        status: "upcoming" as const
      };
      
      const { data: lessonResult, error: lessonError } = await import("@/services/lessonService").then(
        module => module.createLesson(lessonData)
      );
      
      if (lessonError) throw lessonError;
      
      if (lessonResult) {
        toast({
          title: "Успешно",
          description: "Занятие успешно забронировано.",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error booking slot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось забронировать занятие. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setBookingSlot(null);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Calendar section */}
        <TutorCalendar date={date} onDateChange={setDate} />
        
        {/* Available slots section */}
        <div className="md:w-1/2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Доступное время на {format(date, 'd MMMM', { locale: ru })}</h3>
            {loading && <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>}
          </div>
          
          {/* Select subject */}
          <TutorSubjectSelect 
            subjects={subjects} 
            selectedSubject={selectedSubject} 
            onSubjectChange={setSelectedSubject} 
          />
          
          {/* Time slots */}
          <TutorScheduleSlots 
            loading={loading} 
            availableSlots={availableSlots} 
            bookingSlot={bookingSlot} 
            onBookSlot={handleBookSlot} 
          />
        </div>
      </div>
      
      <TutorScheduleFooter tutorName={tutorName} onClose={onClose} />
    </div>
  );
};
