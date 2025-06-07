
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/useAuth";
import { StudentMobileLayout } from "@/components/mobile/StudentMobileLayout";
import { LessonRequestsSection } from "@/components/profile/student/LessonRequestsSection";
import { MyTutorsTab } from "@/components/profile/student/MyTutorsTab";
import { FindTutorsTab } from "@/components/profile/student/FindTutorsTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { NotificationsTab } from "@/components/profile/student/NotificationsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { StudentProfileForm } from "@/components/profile/student/StudentProfileForm";

const StudentProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <StudentMobileLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 lg:grid-cols-7 w-full">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="my-tutors">Мои репетиторы</TabsTrigger>
              <TabsTrigger value="find-tutors">Найти репетиторов</TabsTrigger>
              <TabsTrigger value="requests">Запросы</TabsTrigger>
              <TabsTrigger value="chats">Чаты</TabsTrigger>
              <TabsTrigger value="homework">Домашние задания</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold mb-6">Профиль студента</h1>
                  <StudentProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-tutors">
              <MyTutorsTab />
            </TabsContent>

            <TabsContent value="find-tutors">
              <FindTutorsTab />
            </TabsContent>

            <TabsContent value="requests">
              <LessonRequestsSection />
            </TabsContent>

            <TabsContent value="chats">
              <ChatsTab />
            </TabsContent>

            <TabsContent value="homework">
              <HomeworkTab />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentMobileLayout>
  );
};

export default StudentProfilePage;
