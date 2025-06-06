
import React from "react";
import { useProfile } from "@/hooks/profiles/useProfile";
import { Loader } from "@/components/ui/loader";
import { ProfileTab } from "@/components/profile/student/ProfileTab";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentEditProfilePage = () => {
  const { isLoading } = useProfile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Редактирование профиля</h1>
        <ProfileTab />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentEditProfilePage;
