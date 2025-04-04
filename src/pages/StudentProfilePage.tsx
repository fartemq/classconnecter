
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

  // Only show sidebar on specific routes
  const showSidebar = location.pathname.includes("/profile/student/edit");

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

  // Redirect to schedule tab if the user navigates to /profile/student directly
  if (location.pathname === "/profile/student") {
    return <Navigate to="/profile/student/schedule" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          {showSidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Sidebar when showing */}
              <div className="col-span-1">
                {profile && <StudentSidebar profile={profile} />}
              </div>
              
              {/* Main content area with sidebar */}
              <div className="col-span-1 lg:col-span-4">
                <StudentProfileNav />
                <Card className="p-6 shadow-md border-none min-h-[600px]">
                  <Outlet />
                </Card>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* Full-width content area without sidebar */}
              <StudentProfileNav />
              <Card className="p-6 shadow-md border-none min-h-[600px]">
                <Outlet />
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentProfilePage;
