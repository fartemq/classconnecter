
import React from "react";
import { Footer } from "@/components/Footer";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { useProfile } from "@/hooks/useProfile";
import { StudentProfileCard } from "@/components/profile/student/StudentProfileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudentMobileLayoutProps {
  children: React.ReactNode;
  showProfileCard?: boolean;
}

export const StudentMobileLayout: React.FC<StudentMobileLayoutProps> = ({ 
  children, 
  showProfileCard = true 
}) => {
  const { profile } = useProfile("student");
  const isMobile = useIsMobile();
  
  if (isMobile) {
    // Mobile layout - full width with just content (Header is handled globally)
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow bg-gray-50">
          <div className="px-4 py-4">
            {children}
          </div>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // Desktop layout - with sidebar
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50 py-8">
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
      <Footer className="py-2" />
    </div>
  );
};
