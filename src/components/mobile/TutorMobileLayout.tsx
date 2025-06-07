
import React from "react";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { TutorMobileNav } from "@/components/profile/tutor/TutorMobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorMobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorMobileLayout: React.FC<TutorMobileLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-4">
          {children}
        </div>
        <TutorMobileNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    );
  }

  // Desktop layout - with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <TutorSidebar activeTab={activeTab} onTabChange={onTabChange} />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
