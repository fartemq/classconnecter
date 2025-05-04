
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TutorNavigation } from "./header/TutorNavigation";
import { GuestNavigation } from "./header/GuestNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on a tutor profile page
  const isTutorProfile = location.pathname.startsWith('/profile/tutor');

  // Generate navigation items based on user role
  const getNavigationItems = () => {
    // If user is a student, don't show navigation in header (it's moved to dashboard)
    if (user && userRole === "student") {
      return null;
    }
    
    // If user is a tutor, show tutor navigation
    else if (user && userRole === "tutor") {
      return <TutorNavigation />;
    } 
    
    // For unauthenticated users, show standard menu
    return <GuestNavigation />;
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
        
        {/* Only show auth buttons if not on tutor profile page */}
        {!isTutorProfile && (
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
