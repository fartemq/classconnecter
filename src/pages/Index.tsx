
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { EmergencyLogout } from "@/components/auth/EmergencyLogout";
import { useAuth } from "@/hooks/auth/useAuth";
import { logger } from "@/utils/logger";

const MAIN_ADMIN_EMAIL = "arsenalreally35@gmail.com";
const EMERGENCY_TIMEOUT = 1500;

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showEmergency, setShowEmergency] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Show emergency buttons if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmergency(true);
    }, EMERGENCY_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = useCallback(() => {
    if (!user || redirectAttempted) return;
    
    setRedirectAttempted(true);
    
    // Exception for main admin - stays on home page
    if (user.email === MAIN_ADMIN_EMAIL) {
      logger.debug("Main admin stays on home page", "index");
      setShowEmergency(false);
      return;
    }
    
    // Determine redirect path
    let redirectPath = "/profile/student"; // default
    
    if (userRole === "admin" || userRole === "moderator") {
      redirectPath = "/admin";
    } else if (userRole === "tutor") {
      redirectPath = "/profile/tutor";
    }
    
    logger.debug("Redirecting user", "index", { 
      email: user.email, 
      path: redirectPath, 
      role: userRole 
    });
    
    // Redirect with small delay for stability
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 100);
  }, [user, userRole, navigate, redirectAttempted]);

  // Simple redirect for authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      handleRedirect();
    }
  }, [user, userRole, isLoading, handleRedirect]);

  // Show loading only for the first 1.5 seconds
  if (isLoading && !showEmergency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If loading is delayed, show emergency buttons
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
  
  // Home page for admin (without HeroSection)
  if (user?.email === MAIN_ADMIN_EMAIL) {
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
  
  // If user is authenticated but not yet redirected
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
