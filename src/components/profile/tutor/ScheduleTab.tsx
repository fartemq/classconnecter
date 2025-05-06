
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Lesson {
  id: string;
  subject: {
    name: string;
  };
  date: string;
  time: string;
  duration: number;
  student: {
    first_name: string;
    last_name: string | null;
  };
}

export const ScheduleTab = () => {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Use type assertion to work around TypeScript constraints
        const { data, error } = await supabase.rpc(
          "get_tutor_lessons_by_date", 
          { 
            p_tutor_id: userData.user.id,
            p_date: today
          }
        ) as unknown as { data: Lesson[] | null; error: any };
          
        if (error) throw error;
        
        setLessons(data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessons();
  }, []);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Расписание занятий</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Расписание занятий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            У вас пока нет запланированных занятий.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Расписание занятий</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{lesson.subject.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(lesson.date), 'dd MMMM yyyy', { locale: ru })} в {lesson.time.substring(0, 5)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Студент: {lesson.student.first_name} {lesson.student.last_name || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">
                    {lesson.duration} минут
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
