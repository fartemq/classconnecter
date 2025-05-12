
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GuestNavigation } from "./header/GuestNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, userRole } = useAuth();
  const location = useLocation();
  
  // Check if we're on a profile page
  const isStudentProfile = location.pathname.startsWith('/profile/student');
  const isTutorProfile = location.pathname.startsWith('/profile/tutor');
  const isMainStudentPage = location.pathname === '/profile/student';

  // Generate navigation items based on user role and path
  const getNavigationItems = () => {
    // Only show navigation for non-profile pages
    if (!isStudentProfile && !isTutorProfile) {
      return <GuestNavigation />;
    }
    
    // Return null for profile pages since we use sidebar navigation
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
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
      />
    </header>
  );
};
