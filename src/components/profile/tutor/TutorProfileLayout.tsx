
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorProfileContent } from "@/components/profile/tutor/TutorProfileContent";
import { useIsMobile } from "@/hooks/use-mobile";

export const TutorProfileLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - always show but adapt for mobile */}
      <Header />
      
      <main className="flex-grow">
        <TutorProfileContent />
      </main>
      
      {/* Footer - show on both but adapt */}
      <Footer />
    </div>
  );
};
