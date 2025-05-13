
import React from "react";
import { FindTutorsTab } from "@/components/profile/student/FindTutorsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentFindTutorsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Поиск репетиторов</h1>
        <FindTutorsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentFindTutorsPage;
