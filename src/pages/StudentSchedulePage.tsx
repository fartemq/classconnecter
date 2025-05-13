
import React from "react";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentSchedulePage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Расписание</h1>
        <ScheduleTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentSchedulePage;
