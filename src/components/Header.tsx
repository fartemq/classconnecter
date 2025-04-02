
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StudentNavigation } from "./header/StudentNavigation";
import { TutorNavigation } from "./header/TutorNavigation";
import { GuestNavigation } from "./header/GuestNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, userRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Generate navigation items based on user role
  const getNavigationItems = () => {
    // If user is a student, show student navigation
    if (user && userRole === "student") {
      return <StudentNavigation />;
    }
    
    // If user is a tutor, show tutor navigation
    else if (user && userRole === "tutor") {
      return <TutorNavigation />;
    } 
    
    // For unauthenticated users, show standard menu
    return <GuestNavigation />;
  };

  return (
    <header className="w-full bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-primary text-2xl font-bold">
          Stud.rep
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {getNavigationItems()}
        </nav>
        
        <AuthButtons isAuthenticated={!!user} userRole={userRole} />
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
