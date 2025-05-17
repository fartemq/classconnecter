
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart, 
  Settings,
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/profiles/useProfile";

export const TutorSidebar = () => {
  const location = useLocation();
  const { profile } = useProfile("tutor");
  
  // Функция для получения инициалов из имени и фамилии
  const getInitials = () => {
    if (!profile) return "ТР";
    
    const firstInitial = profile.first_name?.[0] || "";
    const lastInitial = profile.last_name?.[0] || "";
    
    return `${firstInitial}${lastInitial}`.toUpperCase() || "ТР";
  };

  // Проверка активной вкладки
  const isActive = (path: string) => {
    return location.pathname.endsWith(path);
  };

  const navItems = [
    { path: "/profile/tutor", label: "Дашборд", icon: <LayoutDashboard size={18} /> },
    { path: "/profile/tutor/profile", label: "Профиль", icon: <User size={18} /> },
    { path: "/profile/tutor/teaching", label: "Преподавание", icon: <BookOpen size={18} /> },
    { path: "/profile/tutor/schedule", label: "Расписание", icon: <Calendar size={18} /> },
    { path: "/profile/tutor/students", label: "Ученики", icon: <Users size={18} /> },
    { path: "/profile/tutor/chats", label: "Чаты", icon: <MessageSquare size={18} /> },
    { path: "/profile/tutor/stats", label: "Аналитика", icon: <BarChart size={18} /> },
    { path: "/profile/tutor/materials", label: "Материалы", icon: <FileText size={18} /> },
    { path: "/profile/tutor/settings", label: "Настройки", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6 px-2 py-4">
        <Avatar className="h-10 w-10 mr-3">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt="Аватар преподавателя" />
          ) : (
            <AvatarFallback>{getInitials()}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-semibold">
            {profile?.first_name 
              ? `${profile.first_name} ${profile.last_name || ''}`
              : "Преподаватель"
            }
          </div>
          <div className="text-xs text-gray-500">Преподаватель</div>
        </div>
      </div>
      
      <nav className="space-y-1 flex-grow">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className="block"
          >
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal",
                isActive(item.path) 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};
