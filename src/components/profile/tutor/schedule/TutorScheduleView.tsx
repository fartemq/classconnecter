
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/auth/useAuth";
import { generateTutorTimeSlots } from "@/services/lesson/timeSlotsService";
import { format, addDays, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, User, BookOpen } from "lucide-react";
import { TimeSlot } from "@/services/lesson/timeSlotsService";

interface TutorScheduleViewProps {
  tutorId?: string;
  showBookingOptions?: boolean;
  onSlotSelect?: (slot: TimeSlot, date: Date) => void;
}

export const TutorScheduleView: React.FC<TutorScheduleViewProps> = ({
  tutorId,
  showBookingOptions = false,
  onSlotSelect
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [loading, setLoading] = useState(false);
  
  const actualTutorId = tutorId || user?.id;

  useEffect(() => {
    if (actualTutorId) {
      fetchTimeSlots();
    }
  }, [actualTutorId, selectedDate]);

  const fetchTimeSlots = async () => {
    if (!actualTutorId) return;
    
    setLoading(true);
    try {
      const slots = await generateTutorTimeSlots(actualTutorId, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatusColor = (slot: TimeSlot) => {
    return slot.is_available ? "secondary" : "destructive";
  };

  const getSlotStatusText = (slot: TimeSlot) => {
    return slot.is_available ? "Свободно" : "Занято";
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (showBookingOptions && slot.is_available && onSlotSelect) {
      onSlotSelect(slot, selectedDate);
    }
  };

  const renderDayView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ru })}
        </h3>
        <Badge variant="outline">
          {timeSlots.filter(slot => slot.is_available).length} свободных слотов
        </Badge>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Нет доступных слотов на этот день</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timeSlots.map((slot) => (
            <Card 
              key={slot.slot_id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                showBookingOptions && slot.is_available ? 'hover:border-blue-300' : ''
              }`}
              onClick={() => handleSlotClick(slot)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <Badge variant={getSlotStatusColor(slot)}>
                    {getSlotStatusText(slot)}
                  </Badge>
                </div>
                
                {!slot.is_available && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Забронировано</span>
                  </div>
                )}
                
                {showBookingOptions && slot.is_available && (
                  <div className="mt-3 pt-3 border-t">
                    <Button size="sm" className="w-full">
                      Забронировать
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Неделя {format(weekStart, 'd MMMM', { locale: ru })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: ru })}
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <Card key={index} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-center">
                  {format(day, 'EEE', { locale: ru })}
                  <br />
                  {format(day, 'd', { locale: ru })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {/* This would require fetching slots for each day of the week */}
                  <div className="text-xs text-muted-foreground text-center">
                    Слоты загружаются...
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ru}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <Select value={viewMode} onValueChange={(value: 'day' | 'week') => setViewMode(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">День</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {viewMode === 'day' ? renderDayView() : renderWeekView()}
        </div>
      </div>
    </div>
  );
};
