
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { TutorsTab } from "@/components/profile/student/TutorsTab";
import { FavoriteTutorsTab } from "@/components/profile/student/FavoriteTutorsTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Heart, 
  Settings 
} from "lucide-react";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");
  const [activeTab, setActiveTab] = useState("schedule");

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
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет ученика</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced sidebar with user info */}
            <div className="col-span-1">
              {profile && <StudentSidebar profile={profile} />}
            </div>
            
            {/* Main content with expanded tabs */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-0 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-white p-0">
                    <TabsTrigger 
                      value="schedule" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <Calendar size={16} className="mr-2" />
                      Расписание
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tutors" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <Users size={16} className="mr-2" />
                      Репетиторы
                    </TabsTrigger>
                    <TabsTrigger 
                      value="favorites" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <Heart size={16} className="mr-2" />
                      Избранное
                    </TabsTrigger>
                    <TabsTrigger 
                      value="chats" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Сообщения
                    </TabsTrigger>
                    <TabsTrigger 
                      value="homework" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <FileText size={16} className="mr-2" />
                      Домашние задания
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3 px-4 flex items-center"
                    >
                      <Settings size={16} className="mr-2" />
                      Настройки
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="schedule" className="mt-0 p-6">
                    <ScheduleTab />
                  </TabsContent>
                  
                  <TabsContent value="tutors" className="mt-0 p-6">
                    <TutorsTab />
                  </TabsContent>
                  
                  <TabsContent value="favorites" className="mt-0 p-6">
                    <FavoriteTutorsTab />
                  </TabsContent>
                  
                  <TabsContent value="chats" className="mt-0 p-6">
                    <ChatsTab />
                  </TabsContent>
                  
                  <TabsContent value="homework" className="mt-0 p-6">
                    <HomeworkTab />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-0 p-6">
                    <SettingsTab />
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

export default StudentProfilePage;
