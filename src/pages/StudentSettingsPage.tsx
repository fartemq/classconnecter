
import React from "react";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";

const StudentSettingsPage = () => {
  const { profile, isLoading } = useProfile();
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          {profile && <StudentSidebar profile={profile} />}
        </div>
        <div className="lg:col-span-3">
          <SettingsTab />
        </div>
      </div>
    </div>
  );
};

export default StudentSettingsPage;
