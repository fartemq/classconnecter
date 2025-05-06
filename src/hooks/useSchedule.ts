import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createLesson, fetchLessonsByDate } from "@/services/lessonService";
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

interface Tutor {
  id: string;
  name: string;
}

export const useSchedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the student's tutors
  useEffect(() => {
    const fetchStudentTutors = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        const { data, error } = await supabase
          .from('student_requests')
          .select(`
            tutor_id,
            tutor:profiles!tutor_id(
              id,
              first_name,
              last_name
            )
          `)
          .eq('student_id', userData.user.id)
          .eq('status', 'accepted');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedTutors = data.map(item => ({
            id: item.tutor_id,
            name: `${item.tutor.first_name} ${item.tutor.last_name || ''}`
          }));
          
          setTutors(formattedTutors);
          if (formattedTutors.length > 0) {
            setSelectedTutorId(formattedTutors[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };
    
    fetchStudentTutors();
  }, []);
  
  // Fetch tutor's available slots
  useEffect(() => {
    const fetchTutorSlots = async () => {
      if (!selectedTutorId) return;
      
      try {
        setLoading(true);
        
        // Get current day of week (1-7, where 1 is Monday)
        const dayOfWeek = date ? (date.getDay() === 0 ? 7 : date.getDay()) : 1;
        
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
          .eq('tutor_id', selectedTutorId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_available', true);
          
        if (error) throw error;
        
        if (data) {
          const tutor = tutors.find(t => t.id === selectedTutorId);
          
          setAvailableSlots(data.map(slot => ({
            id: slot.id,
            tutorId: slot.tutor_id,
            dayOfWeek: slot.day_of_week,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: slot.is_available,
            tutorName: tutor?.name
          })));
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
  }, [selectedTutorId, date, tutors, toast]);
  
  // Fetch existing lessons
  useEffect(() => {
    const fetchLessons = async () => {
      if (!date) return;
      
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        // Format date as ISO string for the database query
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Use our service to fetch lessons
        const lessonsData = await fetchLessonsByDate(userData.user.id, dateStr);
        setLessons(lessonsData || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };
    
    fetchLessons();
  }, [date]);
  
  const handleBookSlot = async (slot: TimeSlot) => {
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
      
      // Get student's subjects with this tutor
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
      
      // Format date for the database
      const lessonDate = format(date!, 'yyyy-MM-dd');
      
      // Create a new lesson using our service
      const lessonData = {
        student_id: userData.user.id,
        tutor_id: slot.tutorId,
        subject_id: subjectData.subject_id,
        date: lessonDate,
        time: slot.startTime,
        duration: 60, // Default duration, could be calculated from start/end time
        status: "upcoming" as const  // Explicitly cast to the literal type
      };
      
      const { data: lessonResult, error: lessonError } = await createLesson(lessonData);
      
      if (lessonError) throw lessonError;
      
      if (lessonResult) {
        // Add the new lesson to the list
        const newLesson: Lesson = {
          id: lessonResult.id,
          tutor_id: slot.tutorId,
          student_id: userData.user.id,
          subject_id: subjectData.subject_id,
          date: lessonDate,
          time: slot.startTime,
          duration: 60,
          status: "upcoming",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), // Add the updated_at property
          tutor: {
            id: slot.tutorId,
            first_name: slot.tutorName?.split(' ')[0] || '',
            last_name: slot.tutorName?.split(' ')[1] || null
          },
          subject: {
            id: subjectData.subject_id,
            name: subjectData.subject.name
          }
        };
        
        setLessons([...lessons, newLesson]);
        
        toast({
          title: "Успешно",
          description: "Занятие успешно забронировано.",
        });
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
    handleBookSlot
  };
};
