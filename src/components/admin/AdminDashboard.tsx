
import React, { useState } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminStats } from "./AdminStats";
import { UserManagementPanel } from "./UserManagementPanel";
import { DocumentVerificationPanel } from "./DocumentVerificationPanel";
import { AdminChatsPanel } from "./AdminChatsPanel";
import { SubjectManagementPanel } from "./SubjectManagementPanel";
import { AdminLogsPanel } from "./AdminLogsPanel";
import { SystemSettingsPanel } from "./SystemSettingsPanel";

export const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminStats />;
      case 'users':
        return <UserManagementPanel />;
      case 'documents':
        return <DocumentVerificationPanel />;
      case 'chats':
        return <AdminChatsPanel />;
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
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
