
import React, { useState } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

// Mock data for upcoming lessons
const mockLessons = [
  {
    id: 1,
    subject: "Математика",
    tutorName: "Иванов Иван",
    tutorAvatar: null,
    date: new Date(2025, 4, 7, 15, 30), // May 7, 2025, 15:30
    duration: 60, // minutes
    status: "upcoming", // upcoming, completed, canceled
  },
  {
    id: 2,
    subject: "Английский язык",
    tutorName: "Петрова Анна",
    tutorAvatar: null,
    date: new Date(2025, 4, 9, 17, 0), // May 9, 2025, 17:00
    duration: 90, // minutes
    status: "upcoming",
  }
];

export const ScheduleTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Generate the days of the week starting from the selected week
  const weekDays = [...Array(7)].map((_, i) => {
    const date = addDays(selectedWeek, i);
    return {
      date,
      dayName: format(date, 'EEEEEE', { locale: ru }).toUpperCase(),
      dayNumber: format(date, 'd')
    };
  });
  
  // Filter lessons for the selected day
  const getLessonsForDate = (date: Date) => {
    return mockLessons.filter(lesson => 
      isSameDay(lesson.date, date)
    );
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setSelectedWeek(addDays(selectedWeek, -7));
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setSelectedWeek(addDays(selectedWeek, 7));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-600">Расписание занятий</h2>
        <Calendar size={22} className="text-blue-600" />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(selectedWeek, 'LLLL yyyy', { locale: ru })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                Сегодня
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day selector */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => {
              const isToday = isSameDay(day.date, new Date());
              const hasLessons = getLessonsForDate(day.date).length > 0;
              
              return (
                <Button 
                  key={day.dayNumber} 
                  variant={isSameDay(day.date, currentDate) ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-16 relative ${isToday ? 'border-blue-500' : ''}`}
                  onClick={() => setCurrentDate(day.date)}
                >
                  <span className="text-xs">{day.dayName}</span>
                  <span className={`text-lg ${isToday ? 'font-bold' : ''}`}>{day.dayNumber}</span>
                  {hasLessons && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Lessons for the selected day */}
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">{format(currentDate, 'EEEE, d MMMM', { locale: ru })}</h3>
            
            {getLessonsForDate(currentDate).length > 0 ? (
              getLessonsForDate(currentDate).map((lesson) => (
                <div key={lesson.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    {lesson.tutorAvatar ? (
                      <img 
                        src={lesson.tutorAvatar} 
                        alt={lesson.tutorName} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-500 font-medium">{lesson.tutorName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{lesson.subject}</h4>
                      <Badge className="ml-2" variant="outline">
                        {lesson.duration} мин
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {lesson.tutorName} • {format(lesson.date, 'HH:mm')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Детали</Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">На этот день занятий не запланировано</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                >
                  Найти репетитора
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
