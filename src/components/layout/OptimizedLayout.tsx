
import React, { memo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface OptimizedLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const OptimizedLayout = memo<OptimizedLayoutProps>(({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
});

OptimizedLayout.displayName = "OptimizedLayout";
