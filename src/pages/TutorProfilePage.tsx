
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { ScheduleTab } from "@/components/profile/tutor/ScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { StatsTab } from "@/components/profile/tutor/StatsTab";
import { TutorAboutTab } from "@/components/profile/tutor/TutorAboutTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";

const TutorProfilePage = () => {
  const { profile, isLoading } = useProfile("tutor");
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["about", "schedule", "students", "chats", "stats", "settings"].includes(tab)) {
      setActiveTab(tab);
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
    switch (activeTab) {
      case "about":
        return <TutorAboutTab profile={profile} />;
      case "schedule":
        return <ScheduleTab />;
      case "students":
        return <StudentsTab />;
      case "chats":
        return <ChatsTab />;
      case "stats":
        return <StatsTab />;
      case "settings":
        return <TutorSettingsTab profile={profile} />;
      default:
        return <TutorAboutTab profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Личный кабинет репетитора</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced sidebar with user info */}
            <div className="col-span-1">
              {profile && <TutorSidebar profile={profile} />}
            </div>
            
            {/* Main content without the tabs list */}
            <div className="col-span-1 lg:col-span-3">
              <Card className="p-6 shadow-md border-none">
                <Tabs value={activeTab} defaultValue="about">
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
