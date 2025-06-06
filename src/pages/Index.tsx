
import { HeroSection } from "@/components/HeroSection";
import { AdminHeroSection } from "@/components/AdminHeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  // Проверяем, является ли пользователь главным администратором
  const isMainAdmin = user?.email === "arsenalreally35@gmail.com";

  return (
    <div className="min-h-screen">
      <Header />
      {/* Для главного администратора показываем специальную мотивационную секцию */}
      {isMainAdmin ? <AdminHeroSection /> : <HeroSection />}
      {/* Остальные секции показываем только для обычных пользователей */}
      {!isMainAdmin && (
        <>
          <FeaturesSection />
          <TestimonialsSection />
          <CtaSection />
        </>
      )}
      <Footer />
    </div>
  );
};

export default Index;
