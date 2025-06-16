
import React from "react";
import { useNavigate } from "react-router-dom";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/auth/useAuth";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";

const MAIN_ADMIN_EMAIL = "arsenalreally35@gmail.com";

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  // Simple loading state - only while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleLoadingScreen message="Загрузка..." />
      </div>
    );
  }

  // If user is logged in, show redirect button instead of automatic redirect
  if (user && userRole) {
    // Exception for main admin - stays on home page
    if (user.email === MAIN_ADMIN_EMAIL) {
      return (
        <div className="min-h-screen">
          <Header />
          <FeaturesSection />
          <TestimonialsSection />
          <CtaSection />
          <Footer />
        </div>
      );
    }

    // Show manual redirect option for other users
    const getProfilePath = () => {
      if (userRole === "admin" || userRole === "moderator") {
        return "/admin";
      } else if (userRole === "tutor") {
        return "/profile/tutor";
      }
      return "/profile/student";
    };

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Добро пожаловать!</h2>
          <p className="text-gray-600 mb-6">Вы успешно вошли в систему</p>
          <button
            onClick={() => navigate(getProfilePath())}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Перейти в профиль
          </button>
        </div>
      </div>
    );
  }

  // Regular home page for unauthenticated users
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
