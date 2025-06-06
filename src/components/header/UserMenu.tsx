
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminAccessDialog } from "@/components/admin/AdminAccessDialog";

export const UserMenu = () => {
  const { user, userRole, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  // Отладочная информация
  useEffect(() => {
    if (user) {
      console.log("👤 UserMenu Debug Info:");
      console.log("- User ID:", user.id);
      console.log("- User Email:", user.email);
      console.log("- User Role:", userRole);
      console.log("- Is Admin Role:", userRole === "admin");
      console.log("- Is Moderator Role:", userRole === "moderator");
      console.log("- Is Admin/Moderator:", userRole === "admin" || userRole === "moderator");
    }
  }, [user, userRole]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      if (result?.success) {
        toast({
          title: "Успешный выход",
          description: "Вы вышли из системы",
        });
        navigate("/");
      } else {
        throw new Error(result?.error || "Не удалось выйти из системы");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdminAccess = () => {
    setShowAdminDialog(true);
  };

  if (!user) return null;

  const profilePath = userRole === "tutor" ? "/profile/tutor" : "/profile/student";
  const initials = user.email?.charAt(0).toUpperCase() || "U";
  
  // Дополнительная проверка для конкретного админ пользователя
  const isSpecificAdmin = user.email === "arsenalreally35@gmail.com";
  const isAdminOrModerator = userRole === "admin" || userRole === "moderator" || isSpecificAdmin;

  console.log("🔍 Final admin check:", {
    userRole,
    isSpecificAdmin,
    isAdminOrModerator,
    userEmail: user.email
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.email}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {userRole === "tutor" ? "Репетитор" : userRole === "admin" ? "Администратор" : userRole === "moderator" ? "Модератор" : "Ученик"}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={profilePath} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Мой профиль</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`${profilePath}/settings`} className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Настройки</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Показываем ссылку на админ-панель для админов, модераторов и конкретного пользователя */}
          {isAdminOrModerator && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAdminAccess} className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Админ-панель</span>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminAccessDialog 
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
      />
    </>
  );
};
