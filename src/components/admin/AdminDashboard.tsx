
import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminStats } from "./AdminStats";
import { UserManagementPanel } from "./UserManagementPanel";
import { DocumentVerificationPanel } from "./DocumentVerificationPanel";
import { SubjectManagementPanel } from "./SubjectManagementPanel";
import { AdminLogsPanel } from "./AdminLogsPanel";
import { SystemSettingsPanel } from "./SystemSettingsPanel";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

type AdminView = 'dashboard' | 'users' | 'documents' | 'subjects' | 'logs' | 'settings';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  // Дополнительная проверка безопасности
  if (!user || user.email !== "arsenalreally35@gmail.com") {
    console.log("🚫 AdminDashboard: Access denied - not authorized admin");
    return <Navigate to="/" replace />;
  }

  const handleViewChange = (view: string) => {
    setActiveView(view as AdminView);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminStats />;
      case 'users':
        return <UserManagementPanel />;
      case 'documents':
        return <DocumentVerificationPanel />;
      case 'subjects':
        return <SubjectManagementPanel />;
      case 'logs':
        return <AdminLogsPanel />;
      case 'settings':
        return <SystemSettingsPanel />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar activeView={activeView} onViewChange={handleViewChange} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
