
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
import { MaterialsTab } from "@/components/profile/tutor/MaterialsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";
import { TutorAboutTab } from "@/components/profile/tutor/TutorAboutTab";
import { TutorProfileSettingsTab } from "@/components/profile/tutor/TutorProfileSettingsTab";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "profile", "schedule", "students", "chats", "stats", "settings", "materials"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // If no tab is specified, set to dashboard
      setActiveTab("dashboard");
      navigate({ search: "?tab=dashboard" }, { replace: true });
    }
  }, [location.search, navigate]);

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
      case "profile":
        return <TutorProfileSettingsTab profile={profile} />;
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
      case "materials":
        return <MaterialsTab tutorId={profile.id} />;
      default:
        return <TutorDashboard profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64 mb-4 lg:mb-0">
              <Card className="p-4 h-full">
                <TutorSidebar />
              </Card>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              <Card className="p-6 shadow-md border-none">
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

export default TutorProfilePage;
