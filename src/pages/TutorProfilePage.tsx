
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { ScheduleTab } from "@/components/profile/tutor/ScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { StatsTab } from "@/components/profile/tutor/StatsTab";
import { TutorAboutTab } from "@/components/profile/tutor/TutorAboutTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");
  const [activeTab, setActiveTab] = useState("about");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
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
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет репетитора</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced sidebar with user info */}
            <div className="col-span-1">
              {profile && <TutorSidebar profile={profile} />}
            </div>
            
            {/* Main content with expanded tabs */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-0 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-white p-0">
                    <TabsTrigger 
                      value="about" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      О себе
                    </TabsTrigger>
                    <TabsTrigger 
                      value="schedule" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      Расписание
                    </TabsTrigger>
                    <TabsTrigger 
                      value="students" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      Ученики
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chats" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      Сообщения
                    </TabsTrigger>
                    <TabsTrigger 
                      value="stats" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      Статистика
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4"
                    >
                      Настройки
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-0 p-6">
                    <TutorAboutTab profile={profile} />
                  </TabsContent>
                  
                  <TabsContent value="schedule" className="mt-0 p-6">
                    <ScheduleTab />
                  </TabsContent>
                  
                  <TabsContent value="students" className="mt-0 p-6">
                    <StudentsTab />
                  </TabsContent>
                  
                  <TabsContent value="chats" className="mt-0 p-6">
                    <ChatsTab />
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-0 p-6">
                    <StatsTab />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-0 p-6">
                    <TutorSettingsTab profile={profile} />
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorProfilePage;
