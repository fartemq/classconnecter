
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};
