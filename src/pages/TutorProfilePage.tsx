
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { ScheduleTab } from "@/components/profile/tutor/ScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { StatsTab } from "@/components/profile/tutor/StatsTab";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Личный кабинет репетитора</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with user info */}
            <div className="col-span-1">
              {profile && <TutorSidebar profile={profile} />}
            </div>
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <Tabs defaultValue="students">
                <TabsList className="mb-6">
                  <TabsTrigger value="students">Поиск учеников</TabsTrigger>
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                  <TabsTrigger value="chats">Чаты</TabsTrigger>
                  <TabsTrigger value="stats">Статистика</TabsTrigger>
                </TabsList>
                
                <TabsContent value="students">
                  <StudentsTab />
                </TabsContent>
                
                <TabsContent value="schedule">
                  <ScheduleTab />
                </TabsContent>
                
                <TabsContent value="chats">
                  <ChatsTab />
                </TabsContent>
                
                <TabsContent value="stats">
                  <StatsTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorProfilePage;
