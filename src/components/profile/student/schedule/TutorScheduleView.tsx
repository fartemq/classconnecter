import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth/useAuth";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const TutorScheduleView = () => {
  const { user } = useAuth();
  const { tutorId } = useParams();
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tutorId) {
      fetchSchedule();
    }
  }, [tutorId]);

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tutor_schedule')
        .select('*')
        .eq('tutorId', tutorId)
        .order('dayOfWeek')
        .order('startTime');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching tutor schedule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    return days[dayOfWeek];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Расписание репетитора
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-lg font-medium">У репетитора пока нет доступных слотов</p>
            <p className="text-gray-500">Свяжитесь с репетитором, чтобы уточнить расписание</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <h4 className="font-medium">{getDayName(slot.dayOfWeek)}</h4>
                  <p className="text-sm text-gray-500">
                    <Clock className="inline-block h-4 w-4 mr-1" />
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <div>
                  {slot.isAvailable ? (
                    <Badge variant="outline">Доступно</Badge>
                  ) : (
                    <Badge variant="secondary">Недоступно</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
