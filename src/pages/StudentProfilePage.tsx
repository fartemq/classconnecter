
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { StudentProfileCard } from "@/components/profile/student/StudentProfileCard";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");
  const location = useLocation();
  
  // Check if we're on the main student dashboard page
  const isMainDashboard = location.pathname === "/profile/student";
  
  // Parse URL to determine the active tab and any tutor ID for chat
  const getTabContent = () => {
    const path = location.pathname;
    
    if (!profile) return null;
    
    const tutorId = path.split("/chats/")[1];
    
    if (path.includes("/chats")) {
      return tutorId ? <ChatConversation /> : <ChatsTab />;
    } else if (path.includes("/settings")) {
      return <SettingsTab />;
    } else if (path.includes("/edit")) {
      return <div>Edit Profile Content</div>; // Placeholder for edit profile
    } else {
      return <StudentDashboard profile={profile} />;
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {isMainDashboard ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                {profile && <StudentProfileCard profile={profile} />}
              </div>
              <div className="lg:col-span-3">
                <StudentDashboard profile={profile} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 shadow-md border-none">
                {getTabContent()}
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentProfilePage;
