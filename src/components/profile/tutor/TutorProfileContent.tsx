import React, { useState } from "react";
import { TutorSidebar } from "./TutorSidebar";
import { TutorDashboard } from "./TutorDashboard";
import { TutorAboutTab } from "./TutorAboutTab";
import { StudentsTab } from "./StudentsTab";
import { ScheduleTab } from "./ScheduleTab";
import { SubjectsTab } from "./SubjectsTab";
import { ChatsTab } from "./ChatsTab";
import { TutorSettingsTab } from "./TutorSettingsTab";
import { LessonRequestsTab } from "./LessonRequestsTab";
import { NotificationsTab } from "./NotificationsTab";

export const TutorProfileContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <TutorDashboard />;
      case "profile":
        return <TutorAboutTab />;
      case "lesson-requests":
        return <LessonRequestsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "students":
        return <StudentsTab />;
      case "schedule":
        return <ScheduleTab />;
      case "subjects":
        return <SubjectsTab />;
      case "chats":
        return <ChatsTab />;
      case "settings":
        return <TutorSettingsTab />;
      default:
        return <TutorDashboard />;
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
