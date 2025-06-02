
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorProfileContent } from "@/components/profile/tutor/TutorProfileContent";

export const TutorProfileLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <TutorProfileContent />
      </main>
      <Footer />
    </div>
  );
};
