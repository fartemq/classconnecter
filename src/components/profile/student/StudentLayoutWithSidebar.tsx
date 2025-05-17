
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentSidebar } from "./StudentSidebar";
import { useProfile } from "@/hooks/useProfile";
import { StudentProfileCard } from "./StudentProfileCard";

interface StudentLayoutWithSidebarProps {
  children: React.ReactNode;
}

export const StudentLayoutWithSidebar: React.FC<StudentLayoutWithSidebarProps> = ({ children }) => {
  const { profile } = useProfile("student");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile card */}
              {profile && <StudentProfileCard profile={profile} />}
              
              {/* Navigation sidebar */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <StudentSidebar />
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};
