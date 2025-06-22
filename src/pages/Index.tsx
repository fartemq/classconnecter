
import React from "react";
import { useNavigate } from "react-router-dom";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { LoadingManager } from "@/components/loading/LoadingManager";

const MAIN_ADMIN_EMAIL = "arsenalreally35@gmail.com";

const Index = () => {
  const { user, userRole, isLoading, isError } = useSimpleAuth();
  const navigate = useNavigate();

  return (
    <LoadingManager isLoading={isLoading} isError={isError}>
      <div className="min-h-screen">
        <Header />
        
        {/* Если пользователь залогинен, показываем кнопку перехода в профиль */}
        {user && userRole && user.email !== MAIN_ADMIN_EMAIL && (
          <div className="bg-blue-50 border-b border-blue-200 py-3">
            <div className="container mx-auto px-4 text-center">
              <p className="text-blue-800 mb-2">Добро пожаловать! Вы успешно вошли в систему.</p>
              <button
                onClick={() => {
                  if (userRole === "admin" || userRole === "moderator") {
                    navigate("/admin");
                  } else if (userRole === "tutor") {
                    navigate("/profile/tutor");
                  } else {
                    navigate("/profile/student");
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти в профиль
              </button>
            </div>
          </div>
        )}
        
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
        <Footer />
      </div>
    </LoadingManager>
  );
};

export default Index;
