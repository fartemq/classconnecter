
import React from "react";
import { StudentMaterialsTab } from "@/components/profile/student/materials/StudentMaterialsTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentMaterialsPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Учебные материалы</h1>
        <StudentMaterialsTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentMaterialsPage;
