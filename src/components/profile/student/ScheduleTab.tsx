import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const ScheduleTab = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [tutors, setTutors] = useState<Array<{id: string, name: string}>>([]);
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
        status: 'upcoming'
      };
      
      const { data: lessonResult, error: lessonError } = await createLesson(lessonData);
      
      if (lessonError) throw lessonError;
      
      if (lessonResult) {
        // Add the new lesson to the list
        const newLesson: Lesson = {
          id: lessonResult.id,
          tutor: {
            id: slot.tutorId,
            first_name: slot.tutorName?.split(' ')[0] || '',
            last_name: slot.tutorName?.split(' ')[1] || null
          },
          subject: {
            name: subjectData.subject.name
          },
          date: lessonDate,
          time: slot.startTime,
          duration: 60,
          status: 'upcoming'
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
  
  const filteredLessons = lessons.filter(lesson => 
    lesson.status === "upcoming"
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Расписание занятий</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Выберите репетитора:</label>
              <Select
                value={selectedTutorId}
                onValueChange={setSelectedTutorId}
                disabled={tutors.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tutors.length === 0 ? "Нет доступных репетиторов" : "Выберите репетитора"} />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map(tutor => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md pointer-events-auto"
              locale={ru}
              disabled={(day) => day < new Date() || day > addDays(new Date(), 30)}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800 mr-2">•</Badge>
                <span className="text-sm">Запланировано</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-2">•</Badge>
                <span className="text-sm">Завершено</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-4">
              {date ? format(date, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8" />
              </div>
            ) : (
              <>
                {/* Available slots section */}
                {selectedTutorId && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Доступное время для записи:</h4>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    ) : (
                      <p className="text-gray-500">
                        Нет доступного времени для выбранной даты
                      </p>
                    )}
                  </div>
                )}
                
                {/* Scheduled lessons section */}
                <div>
                  <h4 className="font-medium mb-2">Запланированные занятия:</h4>
                  
                  {filteredLessons.length > 0 ? (
                    <div className="space-y-4">
                      {filteredLessons.map(lesson => (
                        <div 
                          key={lesson.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-start justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                              <Clock className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.subject.name}</h4>
                              <p className="text-sm text-gray-600">
                                {lesson.tutor.first_name} {lesson.tutor.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {lesson.time.substring(0, 5)} • {lesson.duration} мин.
                              </p>
                            </div>
                          </div>
                          <Button size="sm">Подключиться</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Нет занятий</h3>
                      <p className="text-gray-500">
                        На выбранную дату занятия не запланированы
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
