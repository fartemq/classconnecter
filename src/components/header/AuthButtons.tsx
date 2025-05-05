
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User, LogOut } from "lucide-react";
import { logoutUser } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

interface AuthButtonsProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

export const AuthButtons = ({ isAuthenticated, userRole }: AuthButtonsProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы"
      });
      // Перенаправление происходит в функции logoutUser
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive"
      });
    }
  };

  // Определяем URL для кнопки профиля в зависимости от роли пользователя
  const getProfileUrl = () => {
    if (userRole === "tutor") {
      return "/profile/tutor";
    } else {
      return "/profile/student";
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <>
          <Button variant="default" className="bg-gray-900 hover:bg-gray-800" asChild>
            <Link to={getProfileUrl()} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Профиль
            </Link>
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </>
      ) : (
        <Button variant="default" className="bg-gray-900 hover:bg-gray-800" asChild>
          <Link to="/login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Войти/Зарегистрироваться
          </Link>
        </Button>
      )}
    </div>
  );
};
