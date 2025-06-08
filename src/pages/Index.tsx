
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/auth/useAuth";

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Автоматическое перенаправление авторизованных пользователей
  useEffect(() => {
    if (!isLoading && user && userRole) {
      // Специальная логика для главного администратора - остается на главной
      if (user.email === "arsenalreally35@gmail.com") {
        return;
      }
      
      // Перенаправляем остальных пользователей на их профили
      let redirectPath = "/profile/student"; // по умолчанию
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }
      
      console.log("Redirecting authenticated user to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, userRole, isLoading, navigate]);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Специальная главная страница БЕЗ HeroSection для главного администратора
  if (user?.email === "arsenalreally35@gmail.com") {
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

  // Обычная главная страница С HeroSection для неавторизованных пользователей
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
