
import React from "react";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentSettingsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <SettingsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentSettingsPage;
