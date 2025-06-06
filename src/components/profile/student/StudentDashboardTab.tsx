
import React from "react";
import { useStudentDashboard } from "./dashboard/useStudentDashboard";
import { ProfileCompletionAlert } from "./dashboard/ProfileCompletionAlert";
import { DashboardStats } from "./dashboard/DashboardStats";
import { QuickActionsGrid } from "./dashboard/QuickActionsGrid";
import { UpcomingLessonsCard } from "./dashboard/UpcomingLessonsCard";

export const StudentDashboardTab = () => {
  const {
    profile,
    upcomingLessons,
    completedLessons,
    isProfileComplete
  } = useStudentDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Добро пожаловать, {profile?.first_name || "Студент"}!
        </h1>
        <p className="text-gray-600">
          Управляйте своим обучением в одном месте
        </p>
      </div>

      <ProfileCompletionAlert isProfileComplete={isProfileComplete} />

      <DashboardStats 
        upcomingLessonsCount={upcomingLessons.length}
        completedLessonsCount={completedLessons.length}
      />

      <QuickActionsGrid />

      <UpcomingLessonsCard upcomingLessons={upcomingLessons} />
    </div>
  );
};
