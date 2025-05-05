
import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay, isToday, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for upcoming lessons
const mockLessons = [
  {
    id: 1,
    subject: "Математика",
    tutorName: "Иванов Иван",
    tutorAvatar: "https://i.pravatar.cc/150?img=1",
    date: new Date(2025, 4, 7, 15, 30), // May 7, 2025, 15:30
    duration: 60, // minutes
    status: "upcoming", // upcoming, completed, canceled
    location: "Онлайн"
  },
  {
    id: 2,
    subject: "Английский язык",
    tutorName: "Петрова Анна",
    tutorAvatar: "https://i.pravatar.cc/150?img=2",
    date: new Date(2025, 4, 9, 17, 0), // May 9, 2025, 17:00
    duration: 90, // minutes
    status: "upcoming",
    location: "ул. Пушкина, д. 10"
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
  
  // Get month and year in Russian
  const currentMonth = format(selectedWeek, 'LLLL yyyy', { locale: ru });
  const formattedCurrentDate = format(currentDate, 'EEEE, d MMMM', { locale: ru });
  
  const todaysLessons = getLessonsForDate(currentDate);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">Расписание занятий</h2>
        <CalendarIcon size={24} className="text-blue-600" />
      </div>
      
      <Card className="shadow-sm mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg capitalize">
            {currentMonth}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedWeek(startOfWeek(today, { weekStartsOn: 1 }));
              }}
              className="h-8 text-xs px-3"
            >
              Сегодня
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day selector */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {weekDays.map((day) => {
              const isCurrentDay = isToday(day.date);
              const hasLessons = getLessonsForDate(day.date).length > 0;
              const isSelected = isSameDay(day.date, currentDate);
              
              return (
                <Button 
                  key={day.dayNumber} 
                  variant={isSelected ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-16 relative 
                    ${isCurrentDay ? 'border-blue-500' : ''}
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                  `}
                  onClick={() => setCurrentDate(day.date)}
                >
                  <span className="text-xs font-medium">{day.dayName}</span>
                  <span className={`text-lg ${isCurrentDay ? 'font-bold' : ''}`}>{day.dayNumber}</span>
                  {hasLessons && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Lessons for the selected day */}
          <div className="mt-6">
            <h3 className="font-medium text-base capitalize mb-4">{formattedCurrentDate}</h3>
            
            {todaysLessons.length > 0 ? (
              <div className="space-y-4">
                {todaysLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-12 w-12 mr-4">
                      {lesson.tutorAvatar ? (
                        <AvatarImage src={lesson.tutorAvatar} alt={lesson.tutorName} />
                      ) : (
                        <AvatarFallback>{lesson.tutorName.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium">{lesson.subject}</h4>
                        <Badge className="ml-2" variant="outline">
                          {lesson.duration} мин
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {lesson.tutorName} • {format(lesson.date, 'HH:mm')}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{lesson.location}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">Детали</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium text-gray-500 mb-2">На этот день занятий не запланировано</p>
                <Button variant="outline" className="mt-2">
                  Найти репетитора
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ближайшие занятия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLessons.length > 0 ? (
              mockLessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-10 w-10 mr-3">
                    {lesson.tutorAvatar ? (
                      <AvatarImage src={lesson.tutorAvatar} alt={lesson.tutorName} />
                    ) : (
                      <AvatarFallback>{lesson.tutorName.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-sm">{lesson.subject}</h4>
                      <Badge className="ml-2 text-xs" variant="outline">
                        {lesson.duration} мин
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {format(lesson.date, 'dd MMMM', { locale: ru })} • {format(lesson.date, 'HH:mm')}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>У вас нет запланированных занятий</p>
                <Button variant="outline" className="mt-4">Найти репетитора</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
