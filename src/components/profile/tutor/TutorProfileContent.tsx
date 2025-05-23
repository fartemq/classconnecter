
import React, { useState } from "react";
import { TutorSidebar } from "./TutorSidebar";
import { TutorDashboard } from "./TutorDashboard";
import { TutorProfileSettingsTab } from "./TutorProfileSettingsTab";
import { StudentsTab } from "./StudentsTab";
import { ScheduleTab } from "./ScheduleTab";
import { SubjectsTab } from "./SubjectsTab";
import { ChatsTab } from "./ChatsTab";
import { TutorSettingsTab } from "./TutorSettingsTab";
import { LessonRequestsTab } from "./LessonRequestsTab";
import { NotificationsTab } from "./NotificationsTab";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";

export const TutorProfileContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();
  const { profile, isLoading } = useProfile("tutor");

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
        return <TutorDashboard profile={profile} />;
      case "profile":
        return <TutorProfileSettingsTab profile={profile} />;
      case "lesson-requests":
        return <LessonRequestsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "students":
        return <StudentsTab />;
      case "schedule":
        return <ScheduleTab />;
      case "subjects":
        return <SubjectsTab tutorId={user.id} />;
      case "chats":
        return <ChatsTab />;
      case "settings":
        return <TutorSettingsTab profile={profile} />;
      default:
        return <TutorDashboard profile={profile} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TutorSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
