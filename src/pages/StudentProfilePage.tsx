
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { TutorsTab } from "@/components/profile/student/TutorsTab";
import { FavoriteTutorsTab } from "@/components/profile/student/FavoriteTutorsTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { StudentDashboard } from "@/components/StudentDashboard";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Parse URL to determine the active tab and any tutor ID for chat
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/chats/")) {
      setActiveTab("chats");
    } else if (path.includes("/schedule")) {
      setActiveTab("schedule");
    } else if (path.includes("/tutors")) {
      setActiveTab("tutors");
    } else if (path.includes("/favorites")) {
      setActiveTab("favorites");
    } else if (path.includes("/homework")) {
      setActiveTab("homework");
    } else if (path.includes("/settings")) {
      setActiveTab("settings");
    } else if (path.includes("/edit")) {
      setActiveTab("edit");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Function to render the active tab content
  const renderTabContent = () => {
    if (!profile) return null;
    
    const tutorId = location.pathname.split("/chats/")[1];
    
    switch (activeTab) {
      case "dashboard":
        return <StudentDashboard profile={profile} />;
      case "schedule":
        return <ScheduleTab />;
      case "tutors":
        return <TutorsTab />;
      case "favorites":
        return <FavoriteTutorsTab />;
      case "chats":
        return tutorId ? <ChatConversation /> : <ChatsTab />;
      case "homework":
        return <HomeworkTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <StudentDashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет ученика</h1>
          
          <Card className="p-6 shadow-md border-none">
            {renderTabContent()}
          </Card>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentProfilePage;
