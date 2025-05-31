
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { StudentSidebar } from "./StudentSidebar";
import { StudentHomeworkView } from "./homework/StudentHomeworkView";
import { StudentScheduleView } from "./schedule/StudentScheduleView";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";

export const StudentProfileContent = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    if (pathParts.includes('homework')) {
      return "homework";
    } else if (pathParts.includes('schedule')) {
      return "schedule";
    } else if (pathParts.includes('chats')) {
      return "chats";
    } else if (pathParts.includes('find-tutors')) {
      return "find-tutors";
    } else if (pathParts.includes('my-tutors')) {
      return "my-tutors";
    } else if (pathParts.includes('profile')) {
      return "profile";
    } else if (pathParts.includes('progress')) {
      return "progress";
    } else if (pathParts.includes('settings')) {
      return "settings";
    } else {
      return "dashboard";
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const { user } = useAuth();
  const { profile, isLoading } = useProfile("student");

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
      case "homework":
        return <StudentHomeworkView />;
      case "schedule":
        return <StudentScheduleView />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Выберите раздел в меню</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
