
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
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminAccessDialog } from "@/components/admin/AdminAccessDialog";
import { logger } from "@/utils/logger";

export const UserMenu = () => {
  const { user, userRole, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  // Debug information
  useEffect(() => {
    if (user) {
      logger.debug('UserMenu debug info', 'user-menu', {
        userId: user.id,
        email: user.email,
        role: userRole,
        isAdmin: userRole === "admin",
        isModerator: userRole === "moderator"
      });
    }
  }, [user, userRole]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const success = await logout();
      if (success) {
        toast({
          title: "Успешный выход",
          description: "Вы вышли из системы",
        });
        navigate("/");
      } else {
        throw new Error("Не удалось выйти из системы");
      }
    } catch (error) {
      logger.error('Logout error', 'user-menu', error);
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

  // Get profile path based on role with fallback
  const getProfilePath = () => {
    if (!userRole) return "/profile/student"; // fallback
    
    if (userRole === "admin" || userRole === "moderator") {
      return "/admin";
    } else if (userRole === "tutor") {
      return "/profile/tutor";
    } else {
      return "/profile/student";
    }
  };

  const profilePath = getProfilePath();
  const initials = user.email?.charAt(0).toUpperCase() || "U";
  
  // Check for admin access
  const isSpecificAdmin = user.email === "arsenalreally35@gmail.com" || user.id === "861128e6-be26-48ee-b576-e7accded9f70";
  const isAdminOrModerator = userRole === "admin" || userRole === "moderator" || isSpecificAdmin;

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
        <DropdownMenuContent className="w-56 bg-white z-50" align="end" forceMount>
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
          
          {/* Show admin panel link for admins, moderators and specific user */}
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
