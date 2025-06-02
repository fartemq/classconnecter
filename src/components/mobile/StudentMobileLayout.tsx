
import React from "react";
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
    // Mobile layout - full width with just content
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow">
          <div className="px-4 py-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // This should not be reached as we handle desktop in parent component
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
};
