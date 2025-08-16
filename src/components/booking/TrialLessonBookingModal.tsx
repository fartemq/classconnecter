import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, CalendarDays, BookOpen, User, Star } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  tutor_profile: {
    experience: number;
    methodology: string;
  };
  tutor_subjects: Array<{
    id: string;
    hourly_rate: number;
    subject: {
      id: string;
      name: string;
    };
  }>;
  reviews: Array<{
    rating: number;
    comment: string;
  }>;
}

interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface TrialLessonBookingModalProps {
  tutor: Tutor;
  children: React.ReactNode;
}

export const TrialLessonBookingModal: React.FC<TrialLessonBookingModalProps> = ({
  tutor,
  children
}) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Generate time slots for selected date
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['tutorTimeSlots', tutor.id, selectedDate?.toDateString()],
    queryFn: async () => {
      if (!selectedDate) return [];
      
      const { data, error } = await supabase.rpc('generate_tutor_time_slots', {
        p_tutor_id: tutor.id,
        p_date: format(selectedDate, 'yyyy-MM-dd')
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedDate
  });

  const handleBooking = async () => {
    if (!selectedSlot || !user?.id || !selectedDate || !selectedSubject) return;

    setIsBooking(true);
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user.id,
          tutor_id: tutor.id,
          subject_id: selectedSubject,
          requested_date: format(selectedDate, 'yyyy-MM-dd'),
          requested_start_time: selectedSlot.start_time,
          requested_end_time: selectedSlot.end_time,
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Ваш запрос на пробное занятие отправлен репетитору. Вы получите уведомление о статусе."
      });

      // Reset form and close modal
      setSelectedDate(undefined);
      setSelectedSubject("");
      setSelectedSlot(null);
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error('Error booking trial lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос на занятие",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const getSubjectPrice = (subjectId: string) => {
    const subject = tutor.tutor_subjects.find(s => s.subject.id === subjectId);
    return subject?.hourly_rate || 0;
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    return Math.round(diff / (1000 * 60)); // minutes
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Пробное занятие с репетитором
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tutor Info */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={tutor.avatar_url || ""} />
                  <AvatarFallback>
                    {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {tutor.first_name} {tutor.last_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {tutor.city && (
                        <div className="flex items-center space-x-1">
                          <span>{tutor.city}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Опыт: {tutor.tutor_profile?.experience} лет</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{calculateAverageRating(tutor.reviews).toFixed(1)}</span>
                        <span>({tutor.reviews.length})</span>
                      </div>
                    </div>
                  </div>
                  
                  {tutor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tutor.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject and Date Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Выбор предмета и даты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Предмет</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.tutor_subjects.map(ts => (
                          <SelectItem key={ts.subject.id} value={ts.subject.id}>
                            {ts.subject.name} - {ts.hourly_rate}₽/час
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Дата занятия</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      locale={ru}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Доступное время</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Выберите дату для просмотра доступного времени</p>
                    </div>
                  ) : slotsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader className="w-8 h-8" />
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>На выбранную дату нет доступного времени</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.filter((slot: TimeSlot) => slot.is_available).map((slot: TimeSlot) => (
                        <Button
                          key={slot.slot_id}
                          variant={selectedSlot?.slot_id === slot.slot_id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSlot(slot)}
                          className="text-xs"
                        >
                          {slot.start_time.substring(0, 5)}
                          <br />
                          <span className="text-[10px] opacity-70">
                            {getDuration(slot.start_time, slot.end_time)} мин
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Details */}
          {selectedSlot && selectedSubject && selectedDate && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-800">Детали бронирования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Предмет:</span>
                    <span className="font-medium">
                      {tutor.tutor_subjects.find(s => s.subject.id === selectedSubject)?.subject.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Дата:</span>
                    <span className="font-medium">
                      {format(selectedDate, "d MMMM yyyy", { locale: ru })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Время:</span>
                    <span className="font-medium">
                      {selectedSlot.start_time.substring(0, 5)} - {selectedSlot.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Стоимость:</span>
                    <span className="font-medium text-green-600">
                      {getSubjectPrice(selectedSubject)}₽/час
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Сообщение репетитору (необязательно)</Label>
                  <Textarea
                    id="message"
                    placeholder="Расскажите о ваших целях и пожеланиях к занятию..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    Отменить
                  </Button>
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isBooking ? (
                      <>
                        <Loader className="w-4 h-4 mr-2" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить запрос"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};