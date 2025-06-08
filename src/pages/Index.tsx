
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
  
  // Показываем экстренные кнопки если загрузка длится слишком долго
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergency(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Простая логика перенаправления
  useEffect(() => {
    if (!isLoading && user) {
      // Специальная логика для главного администратора - остается на главной
      if (user.email === "arsenalreally35@gmail.com") {
        setShowEmergency(false);
        return;
      }
      
      // Перенаправляем остальных пользователей
      let redirectPath = "/profile/student"; // по умолчанию
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }
      
      console.log("Redirecting authenticated user to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } else if (!isLoading && !user) {
      // Пользователь не авторизован - остается на главной
      setShowEmergency(false);
    }
  }, [user, userRole, isLoading, navigate]);

  // Показываем загрузку только первые 2 секунды
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
      {/* Показываем экстренные кнопки если пользователь авторизован но не перенаправлен */}
      {user && <EmergencyLogout />}
    </div>
  );
};

export default Index;
