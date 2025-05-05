
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TutorNavigation } from "./header/TutorNavigation";
import { StudentNavigation } from "./header/StudentNavigation";
import { GuestNavigation } from "./header/GuestNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on a profile page
  const isStudentProfile = location.pathname.startsWith('/profile/student');
  const isTutorProfile = location.pathname.startsWith('/profile/tutor');
  const isMainStudentPage = location.pathname === '/profile/student';

  // Generate navigation items based on user role and path
  const getNavigationItems = () => {
    // Only show student navigation when on student profile pages but not on main dashboard
    if (user && userRole === "student" && isStudentProfile && !isMainStudentPage) {
      return <StudentNavigation />;
    }
    // If user is a tutor, show tutor navigation
    else if (user && userRole === "tutor" && isTutorProfile) {
      return <TutorNavigation />;
    } 
    // For unauthenticated users or student not on profile page, show standard menu
    else if (!isStudentProfile && !isTutorProfile) {
      return <GuestNavigation />;
    }
    
    // Return null for other cases
    return null;
  };

  return (
    <header className="w-full bg-white py-3 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-primary text-2xl font-bold">
          Stud.rep
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {getNavigationItems()}
        </nav>
        
        {/* Only show auth buttons if not on profile pages */}
        {!isStudentProfile && !isTutorProfile && (
          <AuthButtons isAuthenticated={!!user} userRole={userRole} />
        )}
      </div>
      
      {/* Mobile navigation menu */}
      <MobileNavigation 
        isAuthenticated={!!user}
        userRole={userRole}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
    </header>
  );
};
