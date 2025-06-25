
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EnhancedScheduleManager } from "@/components/profile/tutor/schedule/EnhancedScheduleManager";
import { TutorScheduleView } from "@/components/profile/tutor/schedule/TutorScheduleView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TutorSchedulePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Управление расписанием</h1>
              <p className="text-muted-foreground">
                Настройте свое рабочее время и просматривайте забронированные занятия
              </p>
            </div>
            
            <Tabs defaultValue="manage" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Настройка расписания</TabsTrigger>
                <TabsTrigger value="view">Просмотр расписания</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manage" className="space-y-6">
                <EnhancedScheduleManager />
              </TabsContent>
              
              <TabsContent value="view" className="space-y-6">
                <TutorScheduleView showBookingOptions={false} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default TutorSchedulePage;
