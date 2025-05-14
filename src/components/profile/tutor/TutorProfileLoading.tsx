
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/ui/loader";

export const TutorProfileLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <Loader size="lg" />
      </main>
      <Footer />
    </div>
  );
};
