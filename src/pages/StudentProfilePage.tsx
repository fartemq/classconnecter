
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";

const StudentProfilePage = () => {
  const { profile, isLoading, error } = useStudentProfile();
  const { user, isLoading: authLoading } = useAuth();
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

  // Show loading while auth or profile is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Загружаем профиль...</p>
              <p className="text-sm text-gray-500">Настраиваем ваш аккаунт ученика</p>
            </div>
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show error if there's an error and no user
  if (error && !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              Произошла ошибка при загрузке профиля. Пожалуйста, войдите в систему.
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              Необходимо войти в систему для доступа к профилю.
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show creating profile message if profile doesn't exist yet but user exists
  if (!profile && user && !error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <Alert className="max-w-md border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                Создаем ваш профиль ученика. Это займет всего несколько секунд...
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show wizard if profile is incomplete and we're on main dashboard
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
