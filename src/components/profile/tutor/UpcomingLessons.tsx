
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, Book, User } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { EmptyState } from "./dashboard/EmptyState";

interface UpcomingLessonsProps {
  tutorId: string;
}

export const UpcomingLessons: React.FC<UpcomingLessonsProps> = ({ tutorId }) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setIsLoading(true);
        // Запрашиваем предстоящие уроки для данного репетитора
        const { data, error } = await supabase
          .from("lessons")
          .select(`
            id,
            start_time,
            end_time,
            status,
            subject_id (id, name),
            student_id,
            profiles!lessons_student_id_fkey (first_name, last_name, avatar_url)
          `)
          .eq("tutor_id", tutorId)
          .gte("start_time", new Date().toISOString())
          .not('status', 'eq', 'cancelled')
          .order("start_time", { ascending: true })
          .limit(5);

        if (error) throw error;
        
        setLessons(data || []);
      } catch (err) {
        console.error("Error fetching upcoming lessons:", err);
        setError("Не удалось загрузить предстоящие занятия");
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) {
      fetchLessons();
    }
  }, [tutorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        <p>{error}</p>
        <p className="text-sm mt-2">Попробуйте обновить страницу</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        title="Нет предстоящих занятий"
        description="У вас пока нет запланированных занятий."
      />
    );
  }

  // Функция для форматирования даты занятия
  const formatLessonDate = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    return {
      date: formatDate(start),
      time: `${formatTime(start)} - ${formatTime(end)}`
    };
  };

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => {
        const { date, time } = formatLessonDate(lesson.start_time, lesson.end_time);
        const student = lesson.profiles || { first_name: "Ученик", last_name: "" };
        const subject = lesson.subject_id || { name: "Предмет не указан" };
        
        return (
          <div key={lesson.id} className="border rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-3">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{`${student.first_name} ${student.last_name}`}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Book className="h-3.5 w-3.5 mr-1" />
                    <span>{subject.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
              <div className="flex items-center justify-start md:justify-end text-sm text-gray-500">
                <CalendarClock className="h-3.5 w-3.5 mr-1" />
                <span>{date}</span>
              </div>
              <div className="text-sm font-medium mt-1">{time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
