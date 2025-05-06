
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lesson } from "@/types/lesson";
import { createLesson } from "@/services/lessonService";

interface TimeSlot {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TutorScheduleViewProps {
  tutorId: string;
  onClose: () => void;
}

export const TutorScheduleView = ({ tutorId, onClose }: TutorScheduleViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
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
  
  const handleBookSlot = async (slot: TimeSlot) => {
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
      
      const { data: lessonResult, error: lessonError } = await createLesson(lessonData);
      
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
        <div className="md:w-1/2">
          <h3 className="font-medium mb-2">Выберите дату:</h3>
          <div className="border rounded-lg p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              locale={ru}
              disabled={{ before: new Date() }}
            />
          </div>
        </div>
        
        {/* Available slots section */}
        <div className="md:w-1/2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Доступное время на {format(date, 'd MMMM', { locale: ru })}</h3>
            {loading && <Loader className="w-4 h-4" />}
          </div>
          
          {/* Select subject */}
          <div className="mb-4">
            <h4 className="text-sm text-gray-500 mb-1">Выберите предмет:</h4>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Time slots */}
          <div className="border rounded-lg p-3 min-h-[180px] flex flex-col">
            {!loading && availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                <CalendarDays className="h-10 w-10 mb-2 text-gray-400" />
                <p>На выбранную дату нет доступного времени.</p>
                <p className="text-sm">Пожалуйста, выберите другую дату.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {availableSlots.map(slot => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="py-2 h-auto"
                    onClick={() => handleBookSlot(slot)}
                    disabled={bookingSlot === slot.id}
                  >
                    {bookingSlot === slot.id ? (
                      <Loader className="w-4 h-4 mr-2" />
                    ) : (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          Репетитор: {tutorName}
        </p>
        <Button variant="outline" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  );
};
