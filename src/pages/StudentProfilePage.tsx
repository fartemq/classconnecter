
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/student/ProfileTab";
import { FindTutorsTab } from "@/components/profile/student/FindTutorsTab";
import { MyTutorsTab } from "@/components/profile/student/MyTutorsTab";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { ProgressTab } from "@/components/profile/student/ProgressTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { LessonRequestsTab } from "@/components/profile/student/LessonRequestsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentProfilePage = () => {
  return (
    <StudentLayoutWithSidebar>
      <Tabs defaultValue="profile" className="w-full">
        <TabsContent value="profile" className="space-y-4">
          <ProfileTab />
        </TabsContent>
        
        <TabsContent value="find-tutors" className="space-y-4">
          <FindTutorsTab />
        </TabsContent>
        
        <TabsContent value="my-tutors" className="space-y-4">
          <MyTutorsTab />
        </TabsContent>
        
        <TabsContent value="lesson-requests" className="space-y-4">
          <LessonRequestsTab />
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab />
        </TabsContent>
        
        <TabsContent value="homework" className="space-y-4">
          <HomeworkTab />
        </TabsContent>
        
        <TabsContent value="chats" className="space-y-4">
          <ChatsTab />
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <ProgressTab />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </StudentLayoutWithSidebar>
  );
};

export default StudentProfilePage;
