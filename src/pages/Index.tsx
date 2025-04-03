
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { useAuth } from "@/hooks/useAuth";
import { StudentDashboard } from "@/components/StudentDashboard";

const Index = () => {
  const { user, userRole } = useAuth();
  const isStudent = user && userRole === "student";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto p-4">
          <SupabaseStatus />
        </div>
        
        {isStudent ? (
          <StudentDashboard />
        ) : (
          <>
            <HeroSection />
            <FeaturesSection />
            <TestimonialsSection />
            <CtaSection />
          </>
        )}
      </main>
      <Footer className="py-2" /> {/* Reduced footer size */}
    </div>
  );
};

export default Index;
