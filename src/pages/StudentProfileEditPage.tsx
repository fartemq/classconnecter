
import React from "react";
import { ProfileTab } from "@/components/profile/student/ProfileTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentProfileEditPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Моя анкета</h1>
        <ProfileTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentProfileEditPage;
