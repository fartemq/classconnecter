
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen, CalendarRange, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ScheduleTab = () => {
  // Mock data - would come from database in real app
  const upcomingLessons = [
    {
      id: 1,
      date: "10 апреля 2025",
      time: "15:00 - 16:30",
      tutor: "Александр Иванов",
      subject: "Математика",
      status: "confirmed"
    }
  ];
  
  const pastLessons = [
    {
      id: 2,
      date: "3 апреля 2025",
      time: "14:00 - 15:30",
      tutor: "Елена Петрова",
      subject: "Физика",
      status: "completed"
    }
  ];
  
  const renderLessonsList = (lessons: any[], emptyMessage: string) => {
    if (lessons.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="shadow-md rounded-xl gradient-card card-hover overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-5">
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary/10 rounded-xl">
                    <CalendarRange className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{lesson.subject}</h3>
                    <div className="flex items-center mt-1 text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{lesson.date}, {lesson.time}</span>
                    </div>
                    <div className="flex items-center mt-1 text-gray-600 text-sm">
                      <User className="w-4 h-4 mr-1" />
                      <span>Репетитор: {lesson.tutor}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  {lesson.status === "confirmed" && (
                    <Badge className="bg-blue-500">Подтверждено</Badge>
                  )}
                  {lesson.status === "completed" && (
                    <Badge className="bg-green-500">Завершено</Badge>
                  )}
                </div>
              </div>
              
              {lesson.status === "confirmed" && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button className="flex items-center text-primary font-medium hover:underline">
                    <span>Присоединиться к уроку</span>
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Расписание занятий</h2>
        <Calendar size={22} className="text-gray-700" />
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="mb-4 rounded-full p-1 w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center justify-center rounded-full py-2 px-4">
            <Clock size={16} className="mr-2" />
            Предстоящие
            <Badge className="ml-2 bg-blue-500">{upcomingLessons.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center justify-center rounded-full py-2 px-4">
            <CheckCircle size={16} className="mr-2" />
            Прошедшие
            <Badge className="ml-2 bg-green-500">{pastLessons.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {renderLessonsList(upcomingLessons, "У вас пока нет запланированных занятий.")}
        </TabsContent>
        
        <TabsContent value="past">
          {renderLessonsList(pastLessons, "У вас пока нет прошедших занятий.")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
