
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStudentProfile } from "@/hooks/profiles/student";
import { StudentDashboard } from "@/components/StudentDashboard";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";
import { StudentProfileWizard } from "@/components/profile/student/StudentProfileWizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const StudentProfilePage = () => {
  const { profile, isLoading, error } = useStudentProfile();
  const { user, isLoading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
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

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Проверяем аутентификацию...</p>
              <p className="text-sm text-gray-500">Подождите немного</p>
            </div>
          </div>
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
            <AlertDescription className="text-blue-700 text-center">
              <p className="mb-4">Необходимо войти в систему для доступа к профилю.</p>
              <Button onClick={() => navigate("/login")}>
                Войти в систему
              </Button>
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show loading while profile is loading (with timeout)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">Загружаем профиль...</p>
              <p className="text-sm text-gray-500">Настраиваем ваш аккаунт ученика</p>
              <div className="mt-4">
                <Button variant="outline" onClick={handleLogout}>
                  Выйти и попробовать снова
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show error with retry options
  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Alert className="max-w-md border-red-200 bg-red-50">
            <AlertDescription className="text-red-700 text-center">
              <p className="mb-4">Произошла ошибка при загрузке профиля: {error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Обновить страницу
                </Button>
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Выйти и войти заново
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Show profile creation message if profile doesn't exist yet but user exists
  if (!profile && user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <LoadingSpinner size="lg" />
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700 text-center">
                <p className="mb-4">Создаем ваш профиль ученика. Это займет всего несколько секунд...</p>
                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                    Обновить страницу
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" className="w-full">
                    Выйти
                  </Button>
                </div>
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
