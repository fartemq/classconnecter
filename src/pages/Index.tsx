
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { EmergencyLogout } from "@/components/auth/EmergencyLogout";
import { useAuth } from "@/hooks/auth/useAuth";

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showEmergency, setShowEmergency] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Показываем экстренные кнопки если загрузка затягивается
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergency(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Простое перенаправление авторизованных пользователей
  useEffect(() => {
    if (!isLoading && user && !redirectAttempted) {
      setRedirectAttempted(true);
      
      // Исключение для главного админа - остается на главной
      if (user.email === "arsenalreally35@gmail.com") {
        console.log("Main admin stays on home page");
        setShowEmergency(false);
        return;
      }
      
      // Определяем путь для перенаправления
      let redirectPath = "/profile/student"; // по умолчанию
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }
      
      console.log("Redirecting user:", user.email, "to:", redirectPath, "role:", userRole);
      
      // Перенаправляем с небольшой задержкой для стабильности
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [user, userRole, isLoading, navigate, redirectAttempted]);

  // Показываем загрузку только первые 1.5 секунды
  if (isLoading && !showEmergency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если загрузка затянулась, показываем экстренные кнопки
  if (isLoading && showEmergency) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
        <EmergencyLogout />
      </div>
    );
  }
  
  // Главная страница для админа (без HeroSection)
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
  
  // Если пользователь авторизован но еще не перенаправлен
  if (user && !redirectAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="text-center">
          <p className="text-gray-600">Перенаправление в профиль...</p>
        </div>
        <EmergencyLogout />
      </div>
    );
  }

  // Обычная главная страница для неавторизованных пользователей
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
