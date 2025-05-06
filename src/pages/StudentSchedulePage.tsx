
import React from "react";
import { ScheduleTab } from "@/components/profile/student/ScheduleTab";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const StudentSchedulePage = () => {
  const { isLoading } = useProfile("student");
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer className="py-2" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScheduleTab />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentSchedulePage;
