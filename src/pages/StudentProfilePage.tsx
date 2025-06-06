
import React from "react";
import { StudentDashboardTab } from "@/components/profile/student/StudentDashboardTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentProfilePage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <StudentDashboardTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentProfilePage;
