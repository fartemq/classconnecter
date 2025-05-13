
import React from "react";
import { MyTutorsTab } from "@/components/profile/student/MyTutorsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentMyTutorsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Мои репетиторы</h1>
        <MyTutorsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentMyTutorsPage;
