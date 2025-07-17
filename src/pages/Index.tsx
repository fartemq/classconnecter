
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

  // Автоматически перенаправляем авторизованных пользователей в их профили
  React.useEffect(() => {
    if (user && userRole && user.email !== MAIN_ADMIN_EMAIL) {
      if (userRole === "admin" || userRole === "moderator") {
        navigate("/admin");
      } else if (userRole === "tutor") {
        navigate("/profile/tutor");
      } else {
        navigate("/profile/student");
      }
    }
  }, [user, userRole, navigate]);

  // Если пользователь авторизован и не админ, не рендерим главную страницу
  if (user && userRole && user.email !== MAIN_ADMIN_EMAIL) {
    return <LoadingManager isLoading={true} isError={false}><div /></LoadingManager>;
  }

  return (
    <LoadingManager isLoading={isLoading} isError={isError}>
      <div className="min-h-screen">
        <Header />
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
