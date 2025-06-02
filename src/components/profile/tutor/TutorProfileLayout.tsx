
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorProfileContent } from "@/components/profile/tutor/TutorProfileContent";
import { useIsMobile } from "@/hooks/use-mobile";

export const TutorProfileLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header only for desktop version */}
      {!isMobile && <Header />}
      
      <main className="flex-grow">
        <TutorProfileContent />
      </main>
      
      {/* Footer only for desktop version */}
      {!isMobile && <Footer />}
    </div>
  );
};
