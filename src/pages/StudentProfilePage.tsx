
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { TutorsTab } from "@/components/profile/student/TutorsTab";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");

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
          <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with user info */}
            <div className="col-span-1">
              {profile && <StudentSidebar profile={profile} />}
            </div>
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <Tabs defaultValue="schedule">
                <TabsList className="mb-6">
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                  <TabsTrigger value="chats">Чаты</TabsTrigger>
                  <TabsTrigger value="homework">Домашние задания</TabsTrigger>
                  <TabsTrigger value="tutors">Мои репетиторы</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule">
                  <ScheduleTab />
                </TabsContent>
                
                <TabsContent value="chats">
                  <ChatsTab />
                </TabsContent>
                
                <TabsContent value="homework">
                  <HomeworkTab />
                </TabsContent>
                
                <TabsContent value="tutors">
                  <TutorsTab />
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

export default StudentProfilePage;
