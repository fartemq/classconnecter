
import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { TutorsTab } from "@/components/profile/student/TutorsTab";
import { FavoriteTutorsTab } from "@/components/profile/student/FavoriteTutorsTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("schedule");

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["schedule", "tutors", "favorites", "chats", "homework", "settings"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // If no tab is specified, default to schedule
      setActiveTab("schedule");
    }
  }, [location.search]);

  // Render the appropriate tab content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "schedule":
        return <ScheduleTab />;
      case "tutors":
        return <TutorsTab />;
      case "favorites":
        return <FavoriteTutorsTab />;
      case "chats":
        return <ChatsTab />;
      case "homework":
        return <HomeworkTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <ScheduleTab />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
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
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет ученика</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced sidebar with user info */}
            <div className="col-span-1">
              {profile && <StudentSidebar profile={profile} />}
            </div>
            
            {/* Main content area - simplified to just show the active tab content */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-6">
                {renderTabContent()}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfilePage;
