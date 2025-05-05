
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { MethodologyTab } from "@/components/profile/tutor/MethodologyTab";
import { MaterialsTab } from "@/components/profile/tutor/MaterialsTab";
import { AdvancedScheduleTab } from "@/components/profile/tutor/AdvancedScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { AdvancedStatsTab } from "@/components/profile/tutor/AdvancedStatsTab";
import { TutorAboutTab } from "@/components/profile/tutor/TutorAboutTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { TutorDashboard } from "@/components/profile/tutor/TutorDashboard";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";
import { TutorProfile } from "@/types/tutor";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check if we're on the main tutor dashboard page
  const isMainDashboard = location.pathname === "/profile/tutor" && !location.search;

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["about", "methodology", "materials", "schedule", "students", "chats", "stats", "settings"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // If no tab is specified, set to dashboard
      setActiveTab("dashboard");
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/profile/tutor?tab=${value}`);
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

  // Convert Profile to TutorProfile
  const tutorProfile: TutorProfile | null = profile ? {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    avatarUrl: profile.avatar_url,
    subjects: [], // Initialize with empty array
    // Add other required properties with default values as needed
    rating: 0,
    reviewsCount: 0,
    completedLessons: 0,
    activeStudents: 0
  } : null;

  // Function to render the active tab content
  const renderTabContent = () => {
    if (!tutorProfile) return null;
    
    switch (activeTab) {
      case "dashboard":
        return <TutorDashboard profile={tutorProfile} />;
      case "about":
        return <TutorAboutTab profile={tutorProfile} />;
      case "methodology":
        return <MethodologyTab profile={tutorProfile} />;
      case "materials":
        return <MaterialsTab tutorId={tutorProfile.id} />;
      case "schedule":
        return <AdvancedScheduleTab tutorId={tutorProfile.id} />;
      case "students":
        return <StudentsTab />;
      case "chats":
        return <ChatsTab />;
      case "stats":
        return <AdvancedStatsTab tutorId={tutorProfile.id} />;
      case "settings":
        return <TutorSettingsTab profile={tutorProfile} />;
      default:
        return <TutorDashboard profile={tutorProfile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет репетитора</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar always visible */}
            <div className="col-span-1">
              {tutorProfile && <TutorSidebar profile={tutorProfile} />}
            </div>
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-6 shadow-md border-none">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="mb-6 flex flex-wrap gap-2">
                    <TabsTrigger value="dashboard">Главная</TabsTrigger>
                    <TabsTrigger value="about">О себе</TabsTrigger>
                    <TabsTrigger value="methodology">Методология</TabsTrigger>
                    <TabsTrigger value="materials">Материалы</TabsTrigger>
                    <TabsTrigger value="schedule">Расписание</TabsTrigger>
                    <TabsTrigger value="students">Ученики</TabsTrigger>
                    <TabsTrigger value="chats">Сообщения</TabsTrigger>
                    <TabsTrigger value="stats">Статистика</TabsTrigger>
                    <TabsTrigger value="settings">Настройки</TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-0 p-0">
                    {renderTabContent()}
                  </TabsContent>
                </Tabs>
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
