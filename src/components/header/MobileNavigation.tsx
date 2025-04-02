
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { TutorNavigation } from "./TutorNavigation";

interface MobileNavigationProps {
  isAuthenticated: boolean;
  userRole: string | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

export const MobileNavigation = ({ 
  isAuthenticated, 
  userRole, 
  isMenuOpen, 
  setIsMenuOpen 
}: MobileNavigationProps) => {
  const location = useLocation();

  // Don't show student navigation in mobile header (it's moved to profile page)
  if (isAuthenticated && userRole === "student") {
    return null;
  }
  
  return (
    <div className="md:hidden mt-4">
      <Button 
        variant="ghost" 
        className="w-full flex justify-between items-center py-2 px-4"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        Меню
        <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isMenuOpen && (
        <div className="bg-white border-t border-gray-100 py-2">
          <div className="flex flex-col space-y-2 px-4">
            {isAuthenticated ? (
              userRole === "tutor" ? (
                // Mobile tutor navigation
                <TutorNavigation />
              ) : null // Don't show student navigation here
            ) : (
              // Mobile guest navigation
              <>
                <Link 
                  to="/subjects"
                  className="text-gray-700 hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Предметы
                </Link>
                <Link 
                  to="/tutors"
                  className={`${location.pathname === "/tutors" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Репетиторы
                </Link>
                <Link 
                  to="/about"
                  className={`${location.pathname === "/about" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  О нас
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
