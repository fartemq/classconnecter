
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestNavigation } from "./header/GuestNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { UserMenu } from "./header/UserMenu";
import { StudentMobileSidebar } from "./mobile/StudentMobileSidebar";
import { TutorMobileSidebar } from "./mobile/TutorMobileSidebar";
import { useAuth } from "@/hooks/auth";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const { user, userRole } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we're on a profile page
  const isStudentProfile = location.pathname.startsWith('/profile/student');
  const isTutorProfile = location.pathname.startsWith('/profile/tutor');

  // Generate navigation items based on user role and path
  const getNavigationItems = () => {
    // Only show navigation for non-profile pages on desktop
    if (!isMobile && !isStudentProfile && !isTutorProfile) {
      return <GuestNavigation />;
    }
    
    return null;
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="w-full bg-white py-3 border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Mobile menu button for authenticated users */}
          {isMobile && user && (isStudentProfile || isTutorProfile) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMobileMenuToggle}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/" className="text-primary text-2xl font-bold">
            Stud.rep
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {getNavigationItems()}
          </nav>
          
          {/* Auth buttons/user menu */}
          {user ? <UserMenu /> : <AuthButtons />}
        </div>
      </header>

      {/* Mobile sidebars */}
      {user && userRole === "student" && (
        <StudentMobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {user && userRole === "tutor" && (
        <TutorMobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}
    </>
  );
};
