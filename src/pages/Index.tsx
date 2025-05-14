
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/auth";
import { StudentDashboard } from "@/components/StudentDashboard";

const Index = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect based on user role
  useEffect(() => {
    if (user && userRole) {
      if (userRole === "tutor") {
        navigate("/profile/tutor");
      } else if (userRole === "student") {
        navigate("/profile/student");
      }
    }
  }, [user, userRole, navigate]);

  // For authenticated users who haven't been redirected yet (while role is loading)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
          <p className="ml-4 text-gray-600">Загрузка...</p>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  if (user && !userRole) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
          <p className="ml-4 text-gray-600">Загрузка профиля...</p>
        </main>
        <Footer className="py-2" />
      </div>
    );
  }

  // For unauthenticated users, show the landing page
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto p-4">
          <SupabaseStatus />
        </div>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default Index;
