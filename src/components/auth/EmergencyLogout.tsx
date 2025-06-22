
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/useAuth";

export const EmergencyLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, logout } = useAuth();

  const handleEmergencyLogout = async () => {
    try {
      setIsLoading(true);
      
      // Сначала пробуем обычный logout
      const success = await logout();
      
      if (success) {
        toast({
          title: "Выход выполнен",
          description: "Вы успешно вышли из системы",
        });
      } else {
        // Если обычный logout не сработал, делаем принудительную очистку
        await supabase.auth.signOut({ scope: 'global' });
        localStorage.clear();
        sessionStorage.clear();
        
        toast({
          title: "Принудительный выход",
          description: "Сессия очищена принудительно",
        });
      }
      
      // Принудительная перезагрузка страницы
      window.location.href = "/";
    } catch (error) {
      console.error("Emergency logout error:", error);
      // Даже при ошибке принудительно очищаем и перезагружаем
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToProfile = () => {
    try {
      // Определяем правильный путь на основе роли
      let profilePath = "/profile/student"; // по умолчанию
      
      if (userRole === "admin" || userRole === "moderator") {
        profilePath = "/admin";
      } else if (userRole === "tutor") {
        profilePath = "/profile/tutor";
      }
      
      console.log("Redirecting to profile:", profilePath, "User role:", userRole);
      navigate(profilePath, { replace: true });
    } catch (error) {
      console.error("Profile navigation error:", error);
      // Fallback - попробуем через window.location
      if (userRole === "tutor") {
        window.location.href = "/profile/tutor";
      } else if (userRole === "admin" || userRole === "moderator") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/profile/student";
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-red-200 rounded-lg p-4 shadow-lg">
      <p className="text-sm text-gray-600 mb-3">Проблемы с авторизацией?</p>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleGoToProfile}
          disabled={isLoading}
        >
          <User className="h-4 w-4 mr-1" />
          В профиль
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={handleEmergencyLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-1" />
          {isLoading ? "Выход..." : "Выйти"}
        </Button>
      </div>
    </div>
  );
};
