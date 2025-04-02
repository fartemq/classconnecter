
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { StudentSidebar } from "@/components/profile/student/StudentSidebar";
import { StudentProfileNav } from "@/components/profile/student/StudentProfileNav";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

const StudentProfilePage = () => {
  const { profile, isLoading } = useProfile("student");
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect to schedule tab if the user navigates to /profile/student directly
  if (location.pathname === "/profile/student") {
    return <Navigate to="/profile/student/schedule" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Личный кабинет ученика</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced sidebar with user info */}
            <div className="col-span-1">
              {profile && <StudentSidebar profile={profile} />}
            </div>
            
            {/* Main content area - increased size */}
            <div className="col-span-1 lg:col-span-3">
              {/* Navigation component */}
              <StudentProfileNav />
              
              <Card className="p-6 shadow-md border-none min-h-[600px]">
                <Outlet />
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer className="py-4" /> {/* Reduced footer size */}
    </div>
  );
};

export default StudentProfilePage;
