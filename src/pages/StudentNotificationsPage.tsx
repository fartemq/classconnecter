
import React from "react";
import { NotificationsTab } from "@/components/profile/student/NotificationsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentNotificationsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Уведомления</h1>
        <NotificationsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentNotificationsPage;
