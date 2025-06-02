
import React from "react";
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
