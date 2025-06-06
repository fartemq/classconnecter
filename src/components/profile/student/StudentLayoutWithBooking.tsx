
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentSidebar } from "./StudentSidebar";
import { useProfile } from "@/hooks/useProfile";
import { StudentProfileCard } from "./StudentProfileCard";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentLayoutWithBookingProps {
  children: React.ReactNode;
  showBookingActions?: boolean;
}

export const StudentLayoutWithBooking: React.FC<StudentLayoutWithBookingProps> = ({ 
  children, 
  showBookingActions = false 
}) => {
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
              {profile && profile.first_name && (
                <StudentProfileCard 
                  profile={{
                    first_name: profile.first_name || "",
                    last_name: profile.last_name || "",
                    avatar_url: profile.avatar_url || null
                  }} 
                />
              )}
              
              {/* Quick booking actions */}
              {showBookingActions && (
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <h3 className="font-medium mb-3">Быстрые действия</h3>
                  <div className="space-y-2">
                    <Link to="/profile/student/find-tutors">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Найти репетитора
                      </Button>
                    </Link>
                    <Link to="/profile/student/schedule">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Посмотреть расписание
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Navigation sidebar */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <StudentSidebar activeTab="dashboard" onTabChange={() => {}} />
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
