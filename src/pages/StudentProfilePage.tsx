
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStudentProfile } from "@/hooks/profiles/student";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";
import { StudentProfileWizard } from "@/components/profile/student/StudentProfileWizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const StudentProfilePage = () => {
  const { profile, isLoading, error } = useStudentProfile();
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if we're on the main student dashboard page
  const isMainDashboard = location.pathname === "/profile/student";
  
  // Check if profile is incomplete and needs wizard
  const isProfileIncomplete = profile && (
    !profile.first_name || 
    !profile.last_name || 
    !profile.city || 
    !profile.bio ||
    !profile.student_profiles?.educational_level ||
    !profile.student_profiles?.subjects?.length
  );

  // Parse URL to determine the active tab and any tutor ID for chat
  const getTabContent = () => {
    const path = location.pathname;
    
    if (!profile) return null;
    
    const tutorId = path.split("/chats/")[1];
    
    if (path.includes("/chats")) {
      return tutorId ? <ChatConversation /> : <ChatsTab />;
    } else if (path.includes("/settings")) {
      return <SettingsTab />;
    } else if (path.includes("/schedule")) {
      return <ScheduleTab />;
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
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Загрузка профиля...</p>
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertDescription>
              Произошла ошибка при загрузке профиля. Пожалуйста, перезагрузите страницу или обратитесь в поддержку.
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertDescription>
              Необходимо войти в систему для доступа к профилю.
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertDescription>
              Создаем ваш профиль. Пожалуйста, подождите...
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show wizard if profile is incomplete
  if (isProfileIncomplete && isMainDashboard) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <StudentProfileWizard />
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Use the sidebar layout for all student profile pages
  return (
    <StudentLayoutWithSidebar>
      {isMainDashboard ? (
        <div className="space-y-6">
          {/* Main dashboard content */}
          <StudentDashboard profile={profile} />
        </div>
      ) : (
        <Card className="p-6 shadow-md border-none">
          {getTabContent()}
        </Card>
      )}
    </StudentLayoutWithSidebar>
  );
};

export default StudentProfilePage;
