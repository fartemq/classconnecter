
import React from "react";
import { StudentSidebar } from "./StudentSidebar";
import { useProfile } from "@/hooks/useProfile";
import { StudentProfileCard } from "./StudentProfileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { StudentMobileLayout } from "@/components/mobile/StudentMobileLayout";

interface StudentLayoutWithSidebarProps {
  children: React.ReactNode;
  showProfileCard?: boolean;
}

export const StudentLayoutWithSidebar: React.FC<StudentLayoutWithSidebarProps> = ({ 
  children, 
  showProfileCard = true 
}) => {
  const { profile } = useProfile("student");
  const isMobile = useIsMobile();
  
  // Mobile version - use mobile layout
  if (isMobile) {
    return (
      <StudentMobileLayout>
        {children}
      </StudentMobileLayout>
    );
  }

  // Desktop version - original design with sidebar and grid
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile card */}
              {profile && showProfileCard && <StudentProfileCard profile={profile} />}
              
              {/* Navigation sidebar */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <StudentSidebar />
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
