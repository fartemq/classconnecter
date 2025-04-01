
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StudentNavigation } from "./header/StudentNavigation";
import { TutorNavigation } from "./header/TutorNavigation";
import { GuestNavigation } from "./header/GuestNavigation";
import { MobileNavigation } from "./header/MobileNavigation";
import { AuthButtons } from "./header/AuthButtons";

export const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем, авторизован ли пользователь
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        // Получаем роль пользователя из профиля
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setUserRole(data.role);
        }
      }
    };

    checkAuth();

    // Подписываемся на изменения статуса авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session) {
          // Получаем роль пользователя при изменении статуса авторизации
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setUserRole(data.role);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Генерируем меню навигации в зависимости от роли пользователя
  const getNavigationItems = () => {
    // Если пользователь - студент, показываем навигацию для студента
    if (isAuthenticated && userRole === "student") {
      return <StudentNavigation />;
    }
    
    // Если пользователь - репетитор, показываем специальное меню для репетиторов
    else if (isAuthenticated && userRole === "tutor") {
      return <TutorNavigation />;
    } 
    
    // Для неавторизованных пользователей показываем стандартное меню
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
        
        <AuthButtons isAuthenticated={isAuthenticated} userRole={userRole} />
      </div>
      
      {/* Mobile navigation menu */}
      <MobileNavigation 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
    </header>
  );
};
