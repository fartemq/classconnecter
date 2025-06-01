
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
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
    // Mobile layout - full width with just header and content
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
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
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="flex">
          <TutorSidebar activeTab={activeTab} onTabChange={onTabChange} />
          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};
