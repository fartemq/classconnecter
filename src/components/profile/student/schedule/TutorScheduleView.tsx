import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useTutorSlots } from "@/hooks/useTutorSlots"; 
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BookingRequest, bookLesson } from "@/services/lessonBookingService";

interface TutorScheduleViewProps {
  tutorId: string;
  onClose?: () => void;
}

export const TutorScheduleView: React.FC<TutorScheduleViewProps> = ({ tutorId, onClose }) => {
  const [date, setDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const { availableSlots, loading, refreshSlots } = useTutorSlots(tutorId, date);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch tutor's subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("tutor_subjects")
          .select(`
            subject_id,
            subjects:subject_id (id, name)
          `)
          .eq("tutor_id", tutorId);
          
        if (error) throw error;
        
        if (data) {
          // Properly map the data to match the expected type
          const formattedSubjects = data.map(item => {
            const subject = item.subjects as { id: string; name: string };
            return {
              id: subject.id,
              name: subject.name
            };
          });
          
          setSubjects(formattedSubjects);
          
          // Select first subject by default
          if (formattedSubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(formattedSubjects[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching tutor subjects:", error);
      }
    };
    
    fetchSubjects();
  }, [tutorId, selectedSubject]);
  
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    
    // Reset selected slot when date changes
    setSelectedSlot(null);
    setDate(newDate);
  };
  
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };
  
  const handleBookLesson = async () => {
    if (!user || !selectedSlot || !selectedSubject) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите предмет и время занятия",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsBooking(true);
      
      // Find the selected slot
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) {
        toast({
          title: "Ошибка",
          description: "Выбранный слот недоступен",
          variant: "destructive"
        });
        return;
      }
      
      const bookingRequest: BookingRequest = {
        studentId: user.id,
        tutorId,
        subjectId: selectedSubject,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };
      
      const result = await bookLesson(bookingRequest);
      
      if (result.success) {
        toast({
          title: "Запрос отправлен",
          description: "Ваш запрос на бронирование занятия успешно отправлен репетитору",
        });
        
        // Close the dialog if provided
        if (onClose) {
          onClose();
        }
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось забронировать занятие",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error booking lesson:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при бронировании занятия",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };
  
  // Filter function for calendar - disable dates in the past
  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Calendar */}
        <div>
          <h3 className="font-medium mb-2">Выберите дату занятия</h3>
          <Card className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              locale={ru}
              className="border-0"
            />
          </Card>
        </div>
        
        {/* Right Column - Subject selection and time slots */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Выберите предмет</h3>
            {subjects.length > 0 ? (
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите предмет" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">Предметы не найдены</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">
              Доступное время {format(date, "d MMMM", { locale: ru })}
            </h3>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader />
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlots
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(slot => (
                    <Button
                      key={slot.id}
                      variant={selectedSlot === slot.id ? "default" : "outline"}
                      onClick={() => handleSlotSelect(slot.id)}
                      className={`text-sm py-2 px-3 h-auto ${
                        selectedSlot === slot.id ? "bg-primary" : "hover:bg-primary/10"
                      }`}
                    >
                      {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                    </Button>
                  ))
                }
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-500">
                  Нет доступных слотов на эту дату
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        )}
        
        <Button 
          onClick={handleBookLesson} 
          disabled={!selectedSlot || !selectedSubject || isBooking}
        >
          {isBooking ? <Loader size="sm" className="mr-2" /> : null}
          {isBooking ? "Бронирование..." : "Забронировать занятие"}
        </Button>
      </div>
    </div>
  );
};
