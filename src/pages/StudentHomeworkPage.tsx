
import React from "react";
import { HomeworkTab } from "@/components/profile/student/HomeworkTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentHomeworkPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Домашние задания</h1>
        <HomeworkTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentHomeworkPage;
