
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const ScheduleTab = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Mock data for lessons
  const lessons = [
    { 
      id: 1, 
      subject: "Математика", 
      tutorName: "Иванов И.И.", 
      time: "14:00", 
      duration: 60,
      status: "upcoming" 
    },
    { 
      id: 2, 
      subject: "Английский язык", 
      tutorName: "Петров П.П.", 
      time: "16:30", 
      duration: 90,
      status: "upcoming" 
    },
    { 
      id: 3, 
      subject: "Физика", 
      tutorName: "Сидоров С.С.", 
      time: "10:00", 
      duration: 60,
      status: "completed" 
    }
  ];

  const filteredLessons = lessons.filter(lesson => 
    date && lesson.status === "upcoming"
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Расписание занятий</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md pointer-events-auto"
              locale={ru}
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
                        <h4 className="font-medium">{lesson.subject}</h4>
                        <p className="text-sm text-gray-600">{lesson.tutorName}</p>
                        <p className="text-sm text-gray-500">
                          {lesson.time} • {lesson.duration} мин.
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
