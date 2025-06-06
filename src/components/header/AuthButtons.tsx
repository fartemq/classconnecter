
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/useAuth";

export const AuthButtons = () => {
  const { user, userRole, logout } = useAuth();
  const { toast } = useToast();

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast({
          title: "Успешный выход",
          description: "Вы вышли из системы",
        });
      } else {
        throw new Error("Не удалось выйти из системы");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {userRole === "tutor" ? (
          <Link to="/profile/tutor">
            <Button variant="ghost">Мой профиль</Button>
          </Link>
        ) : (
          <Link to="/profile/student">
            <Button variant="ghost">Мой профиль</Button>
          </Link>
        )}
        <Button onClick={handleLogout} variant="ghost">
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link to="/login">
        <Button variant="ghost">Войти</Button>
      </Link>
      <Link to="/register">
        <Button>Регистрация</Button>
      </Link>
    </div>
  );
};
