
import React from "react";
import { ProfileCompletionTracker } from "./ProfileCompletionTracker";
import { QuickActionsGrid } from "./dashboard/QuickActionsGrid";
import { DashboardStats } from "./dashboard/DashboardStats";
import { UpcomingLessonsCard } from "./dashboard/UpcomingLessonsCard";
import { AdminMessagesDisplay } from "./AdminMessagesDisplay";
import { useStudentDashboard } from "./dashboard/useStudentDashboard";

export const StudentDashboardTab = () => {
  const { upcomingLessons, completedLessons, loading } = useStudentDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
        <p className="text-gray-600 mt-2">Добро пожаловать в ваш личный кабинет!</p>
      </div>

      <AdminMessagesDisplay />
      <ProfileCompletionTracker />
      <QuickActionsGrid />
      <DashboardStats 
        upcomingLessonsCount={upcomingLessons.length}
        completedLessonsCount={completedLessons.length}
      />
      <UpcomingLessonsCard upcomingLessons={upcomingLessons} />
    </div>
  );
};
