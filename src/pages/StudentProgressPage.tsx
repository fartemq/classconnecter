
import React from "react";
import { ProgressTab } from "@/components/profile/student/ProgressTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentProgressPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Мой прогресс</h1>
        <ProgressTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentProgressPage;
