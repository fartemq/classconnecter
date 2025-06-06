
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { StudentMobileLayout } from "@/components/mobile/StudentMobileLayout";
import { StudentDashboardTab } from "./StudentDashboardTab";
import { ProfileTab } from "./ProfileTab";
import { FindTutorsTab } from "./FindTutorsTab";
import { MyTutorsTab } from "./MyTutorsTab";
import { ChatsTab } from "./ChatsTab";
import { ChatConversation } from "./ChatConversation";
import { ScheduleTab } from "./ScheduleTab";
import { HomeworkTab } from "./HomeworkTab";
import { ProgressTab } from "./ProgressTab";
import { LessonRequestsTab } from "./LessonRequestsTab";
import { NotificationsTab } from "./NotificationsTab";
import { SettingsTab } from "./SettingsTab";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/profiles/useProfile";
import { Loader } from "@/components/ui/loader";

export const StudentProfileContent = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    if (pathParts.includes('chats') && pathParts.length > 4) {
      return "chat-conversation"; // Individual chat view
    } else if (pathParts.includes('chats')) {
      return "chats"; // Chat list
    } else if (pathParts.includes('find-tutors')) {
      return "find-tutors";
    } else if (pathParts.includes('my-tutors')) {
      return "my-tutors";
    } else if (pathParts.includes('schedule')) {
      return "schedule";
    } else if (pathParts.includes('homework')) {
      return "homework";
    } else if (pathParts.includes('progress')) {
      return "progress";
    } else if (pathParts.includes('lesson-requests')) {
      return "lesson-requests";
    } else if (pathParts.includes('notifications')) {
      return "notifications";
    } else if (pathParts.includes('settings')) {
      return "settings";
    } else if (pathParts.includes('profile')) {
      return "profile";
    } else {
      return "dashboard";
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  // Update active tab when location changes
  React.useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  if (isLoading || !profile || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <StudentDashboardTab />;
      case "profile":
        return <ProfileTab />;
      case "find-tutors":
        return <FindTutorsTab />;
      case "my-tutors":
        return <MyTutorsTab />;
      case "chats":
        return <ChatsTab />;
      case "chat-conversation":
        return <ChatConversation />;
      case "schedule":
        return <ScheduleTab />;
      case "homework":
        return <HomeworkTab />;
      case "progress":
        return <ProgressTab />;
      case "lesson-requests":
        return <LessonRequestsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <StudentDashboardTab />;
    }
  };

  return (
    <StudentMobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </StudentMobileLayout>
  );
};
