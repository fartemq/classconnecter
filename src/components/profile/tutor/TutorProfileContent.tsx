
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { TutorSidebar } from "./TutorSidebar";
import { TutorDashboard } from "./TutorDashboard";
import { StudentsTab } from "./StudentsTab";
import { ScheduleManagement } from "./schedule/ScheduleManagement";
import { TutorChatsTab } from "./TutorChatsTab";
import { TutorChatView } from "./TutorChatView";
import { TutorSettingsTab } from "./TutorSettingsTab";
import { LessonRequestsTab } from "./LessonRequestsTab";
import { NotificationsTab } from "./NotificationsTab";
import { TutorAnalytics } from "./analytics/TutorAnalytics";
import { ProfileCompletionChecker } from "./publish/ProfileCompletionChecker";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const TutorProfileContent = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  // Determine active tab from URL
  const getActiveTabFromPath = () => {
    if (pathParts.includes('chats') && pathParts.length > 4) {
      return "chat-view"; // Individual chat view
    } else if (pathParts.includes('chats')) {
      return "chats"; // Chat list
    } else if (pathParts.includes('students')) {
      return "students";
    } else if (pathParts.includes('schedule')) {
      return "schedule";
    } else if (pathParts.includes('stats')) {
      return "analytics";
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
  const { profile, isLoading } = useProfile("tutor");

  // Update active tab when location changes
  React.useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  // Fetch subjects for the profile completion form
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

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
        return <ProfileCompletionChecker profile={profile} subjects={subjects} />;
      case "lesson-requests":
        return <LessonRequestsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "students":
        return <StudentsTab />;
      case "schedule":
        return <ScheduleManagement />;
      case "analytics":
        return <TutorAnalytics tutorId={user.id} />;
      case "chats":
        return <TutorChatsTab />;
      case "chat-view":
        return <TutorChatView />;
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
