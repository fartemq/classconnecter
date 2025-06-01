
import React from "react";
import { StudentMobileLayout } from "@/components/mobile/StudentMobileLayout";

interface StudentLayoutWithSidebarProps {
  children: React.ReactNode;
}

export const StudentLayoutWithSidebar: React.FC<StudentLayoutWithSidebarProps> = ({ children }) => {
  return (
    <StudentMobileLayout>
      {children}
    </StudentMobileLayout>
  );
};
