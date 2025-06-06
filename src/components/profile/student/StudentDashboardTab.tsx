
import React from "react";
import { ProfileCompletionTracker } from "./ProfileCompletionTracker";
import { QuickActionsGrid } from "./dashboard/QuickActionsGrid";
import { DashboardStats } from "./dashboard/DashboardStats";
import { UpcomingLessonsCard } from "./dashboard/UpcomingLessonsCard";
import { AdminMessagesDisplay } from "./AdminMessagesDisplay";

export const StudentDashboardTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
        <p className="text-gray-600 mt-2">Добро пожаловать в ваш личный кабинет!</p>
      </div>

      <AdminMessagesDisplay />
      <ProfileCompletionTracker />
      <QuickActionsGrid />
      <DashboardStats />
      <UpcomingLessonsCard />
    </div>
  );
};
