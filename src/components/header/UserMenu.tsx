
import React, { useState } from "react";
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
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const UserMenu = () => {
  const { user, userRole, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  const profilePath = userRole === "tutor" ? "/profile/tutor" : "/profile/student";
  const initials = user.email?.charAt(0).toUpperCase() || "U";

  return (
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
              {userRole === "tutor" ? "Репетитор" : "Ученик"}
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
  );
};
