
import React from "react";
import { SettingsTab } from "@/components/profile/student/SettingsTab";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const StudentSettingsPage = () => {
  const { profile, isLoading } = useProfile();
  
  if (isLoading) return <Loader />;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>
            <SettingsTab />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentSettingsPage;
