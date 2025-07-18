import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorSearchAndBooking } from "./TutorSearchAndBooking";
import { StudentLessonRequests } from "./StudentLessonRequests";
import { StudentUpcomingLessons } from "./StudentUpcomingLessons";
import { Search, Calendar, Clock } from "lucide-react";

export const StudentBookingManager = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Мои занятия</h1>
        <p className="text-muted-foreground">
          Найдите репетитора, забронируйте занятие и отслеживайте свои уроки
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Найти репетитора</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Мои запросы</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Мои уроки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <TutorSearchAndBooking />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <StudentLessonRequests />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <StudentUpcomingLessons />
        </TabsContent>
      </Tabs>
    </div>
  );
};