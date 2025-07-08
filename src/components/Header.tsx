
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestNavigation } from "./header/GuestNavigation";
import { AuthButtons } from "./header/AuthButtons";
import { UserMenu } from "./header/UserMenu";
import { StudentMobileSidebar } from "./mobile/StudentMobileSidebar";
import { TutorMobileSidebar } from "./mobile/TutorMobileSidebar";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const { user, userRole, isLoading } = useSimpleAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Проверяем страницы профиля
  const isStudentProfile = location.pathname.startsWith('/profile/student');
  const isTutorProfile = location.pathname.startsWith('/profile/tutor');
  const isMainPage = location.pathname === '/';

  // Безопасное определение ссылки профиля
  const getProfileLink = () => {
    if (!user) return "/";
    
    // Если роль еще загружается, используем безопасное значение
    if (isLoading) return "/";
    
    switch (userRole) {
      case "admin":
      case "moderator":
        return "/admin";
      case "tutor":
        return "/profile/tutor";
      case "student":
        return "/profile/student";
      default:
        // Fallback на основе URL, если роль не определена
        if (location.pathname.startsWith('/profile/tutor')) {
          return "/profile/tutor";
        }
        return "/profile/student";
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="w-full bg-white py-3 border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Mobile menu button для авторизованных пользователей */}
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
          
          {/* Logo */}
          {user ? (
            <Link to={getProfileLink()} className="text-primary text-2xl font-bold">
              Stud.rep
            </Link>
          ) : (
            <Link to="/" className="text-primary text-2xl font-bold">
              Stud.rep
            </Link>
          )}
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isMobile && !isStudentProfile && !isTutorProfile && <GuestNavigation />}
            
            {/* Кнопка "В профиль" для авторизованных на главной */}
            {user && isMainPage && !isLoading && (
              <Link to={getProfileLink()}>
                <Button variant="outline" size="sm">
                  В профиль
                </Button>
              </Link>
            )}
          </nav>
          
          {/* Auth buttons/user menu */}
          <div className="flex items-center space-x-4">
            {user && <NotificationCenter />}
            {user ? <UserMenu /> : <AuthButtons />}
          </div>
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
