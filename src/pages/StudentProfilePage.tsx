
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
import { StudentProfileNav } from "@/components/profile/student/StudentProfileNav";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

const StudentProfilePage = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Determine active tab from URL for mobile
  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts.includes('find-tutors')) return "find-tutors";
    if (pathParts.includes('my-tutors')) return "my-tutors";
    if (pathParts.includes('schedule')) return "schedule";
    if (pathParts.includes('homework')) return "homework";
    if (pathParts.includes('chats')) return "chats";
    if (pathParts.includes('progress')) return "progress";
    if (pathParts.includes('settings')) return "settings";
    if (pathParts.includes('edit')) return "profile";
    return "profile";
  };

  const activeTab = getActiveTabFromPath();

  // Mobile version - show content based on route
  if (isMobile) {
    const renderMobileContent = () => {
      switch (activeTab) {
        case "find-tutors":
          return <FindTutorsTab />;
        case "my-tutors":
          return <MyTutorsTab />;
        case "schedule":
          return <ScheduleTab />;
        case "homework":
          return <HomeworkTab />;
        case "chats":
          return <ChatsTab />;
        case "progress":
          return <ProgressTab />;
        case "settings":
          return <SettingsTab />;
        default:
          return <ProfileTab />;
      }
    };

    return (
      <StudentLayoutWithSidebar>
        <div className="space-y-4">
          {renderMobileContent()}
        </div>
      </StudentLayoutWithSidebar>
    );
  }

  // Desktop version - original tabs structure
  return (
    <StudentLayoutWithSidebar>
      <Tabs defaultValue="profile" value={activeTab} className="w-full">
        <StudentProfileNav />
        
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
