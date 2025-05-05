
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { TeachingInfoTab } from "@/components/profile/tutor/TeachingInfoTab";
import { AdvancedScheduleTab } from "@/components/profile/tutor/AdvancedScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { AdvancedStatsTab } from "@/components/profile/tutor/AdvancedStatsTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { TutorDashboard } from "@/components/profile/tutor/TutorDashboard";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["teaching", "schedule", "students", "chats", "stats", "settings"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // If no tab is specified, set to dashboard
      setActiveTab("dashboard");
    }
  }, [location.search]);

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

  // Function to render the active tab content
  const renderTabContent = () => {
    if (!profile) return null;
    
    switch (activeTab) {
      case "dashboard":
        return <TutorDashboard profile={profile} />;
      case "teaching":
        return <TeachingInfoTab profile={profile} />;
      case "schedule":
        return <AdvancedScheduleTab tutorId={profile.id} />;
      case "students":
        return <StudentsTab />;
      case "chats":
        return <ChatsTab />;
      case "stats":
        return <AdvancedStatsTab tutorId={profile.id} />;
      case "settings":
        return <TutorSettingsTab profile={profile} />;
      default:
        return <TutorDashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет репетитора</h1>
          
          <Card className="p-6 shadow-md border-none">
            {renderTabContent()}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorProfilePage;
