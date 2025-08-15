
import React, { useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { TutorMobileLayout } from "@/components/mobile/TutorMobileLayout";
import { TutorDashboard } from "./TutorDashboard";
import { StudentsTab } from "./StudentsTab";
import { ScheduleManagement } from "./schedule/ScheduleManagement";
import { TutorChatsTab } from "./TutorChatsTab";
import { TutorChatView } from "./TutorChatView";
import { TutorSettingsTab } from "./TutorSettingsTab";
import { LessonRequestsTab } from "./LessonRequestsTab";
import { TutorLessonRequests } from "@/components/booking/TutorLessonRequests";
import { NotificationsTab } from "./NotificationsTab";
import { ProfileCompletionChecker } from "./publish/ProfileCompletionChecker";
import { AdvancedScheduleTab } from "./AdvancedScheduleTab";
import { useAuth } from "@/hooks/auth/useAuth";
import { useProfile } from "@/hooks/profiles/useProfile";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/hooks/profiles/types";
import { ErrorBoundary } from "react-error-boundary";

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-center p-8">
    <h2 className="text-xl font-semibold text-red-600 mb-2">Что-то пошло не так</h2>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Попробовать снова
    </button>
  </div>
);

// Lazy load heavy components with better loading states
const LazyTutorAnalytics = React.lazy(() => 
  import("./analytics/TutorAnalytics").then(module => ({ default: module.TutorAnalytics }))
);

const LazyHomeworkManagement = React.lazy(() => 
  import("./homework/TutorHomeworkManagement").then(module => ({ default: module.TutorHomeworkManagement }))
);

const LazyTutorStudentSchedule = React.lazy(() => 
  import("./schedule/TutorStudentSchedule").then(module => ({ default: module.TutorStudentSchedule }))
);

const LazyTutorLessons = React.lazy(() => 
  import("../../../pages/TutorLessonsPage").then(module => ({ default: module.default }))
);

const LoadingFallback = ({ message = "Загрузка..." }: { message?: string }) => (
  <div className="flex justify-center py-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export const TutorProfileContent = React.memo(() => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  const getActiveTabFromPath = () => {
    if (pathParts.includes('chats') && pathParts.length > 4) {
      return "chat-view";
    } else if (pathParts.includes('chats')) {
      return "chats";
    } else if (pathParts.includes('students')) {
      return "students";
    } else if (pathParts.includes('schedule')) {
      if (location.search.includes('student=')) {
        return "student-schedule";
      }
      return "schedule";
    } else if (pathParts.includes('homework')) {
      return "homework";
    } else if (pathParts.includes('stats')) {
      return "analytics";
    } else if (pathParts.includes('settings')) {
      return "settings";
    } else if (pathParts.includes('profile')) {
      return "profile";
    } else if (pathParts.includes('lesson-requests')) {
      return "lesson-requests";
    } else if (pathParts.includes('notifications')) {
      return "notifications";
    } else if (pathParts.includes('lessons')) {
      return "lessons";
    } else {
      return "dashboard";
    }
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  // Update active tab when location changes
  React.useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname, location.search]);

  // Optimized subjects query with better caching
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
  });

  if (isLoading || !profile || !user) {
    return <SimpleLoadingScreen message="Загрузка профиля..." />;
  }

  const tutorProfile = profile as Profile;

  const isEditingSchedule = new URLSearchParams(location.search).get('edit') === '1';

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <TutorDashboard profile={tutorProfile} />;
      case "profile":
        return <ProfileCompletionChecker profile={tutorProfile} subjects={subjects} />;
      case "lesson-requests":
        return <TutorLessonRequests />;
      case "notifications":
        return <NotificationsTab />;
      case "students":
        return <StudentsTab />;
      case "schedule":
        return isEditingSchedule ? <AdvancedScheduleTab tutorId={user.id} /> : <ScheduleManagement />;
      case "student-schedule":
        return (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback message="Загрузка расписания..." />}>
              <LazyTutorStudentSchedule />
            </Suspense>
          </ErrorBoundary>
        );
      case "homework":
        return (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback message="Загрузка домашних заданий..." />}>
              <LazyHomeworkManagement />
            </Suspense>
          </ErrorBoundary>
        );
      case "analytics":
        return (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback message="Загрузка аналитики..." />}>
              <LazyTutorAnalytics tutorId={user.id} />
            </Suspense>
          </ErrorBoundary>
        );
      case "chats":
        return <TutorChatsTab />;
      case "chat-view":
        return <TutorChatView />;
      case "lessons":
        return (
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<LoadingFallback message="Загрузка занятий..." />}>
              <LazyTutorLessons />
            </Suspense>
          </ErrorBoundary>
        );
      case "settings":
        return <TutorSettingsTab profile={tutorProfile} />;
      default:
        return <TutorDashboard profile={tutorProfile} />;
    }
  };

  return (
    <TutorMobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {renderContent()}
      </ErrorBoundary>
    </TutorMobileLayout>
  );
});

TutorProfileContent.displayName = "TutorProfileContent";
