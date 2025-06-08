
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";

export const TutorProfileLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <SimpleLoadingScreen message="Загрузка профиля..." />
      </main>
      <Footer />
    </div>
  );
};
