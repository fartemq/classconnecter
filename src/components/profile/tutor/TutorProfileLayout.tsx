
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { TutorProfile } from "@/types/tutor";
import { TutorProfileContent } from "@/components/profile/tutor/TutorProfileContent";

interface TutorProfileLayoutProps {
  tutorProfile: TutorProfile;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TutorProfileLayout: React.FC<TutorProfileLayoutProps> = ({ 
  tutorProfile, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64 mb-4 lg:mb-0">
              <Card className="p-4 h-full">
                <TutorSidebar activeTab={activeTab} onTabChange={onTabChange} />
              </Card>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              <Card className="p-6 shadow-md border-none">
                <TutorProfileContent 
                  activeTab={activeTab} 
                  tutorProfile={tutorProfile} 
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
