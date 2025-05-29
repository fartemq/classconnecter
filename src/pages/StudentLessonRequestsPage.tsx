
import React from "react";
import { LessonRequestsTab } from "@/components/profile/student/LessonRequestsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentLessonRequestsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Запросы на занятия</h1>
        <LessonRequestsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentLessonRequestsPage;
