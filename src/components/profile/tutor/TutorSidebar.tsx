
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Home, 
  MessageSquare, 
  Settings, 
  Users,
  User
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export const TutorSidebar = () => {
  const location = useLocation();
  const currentPath = location.search || "?tab=dashboard";
  
  const menuItems: SidebarItem[] = [
    {
      label: "Дашборд",
      icon: <Home className="h-4 w-4" />,
      path: "?tab=dashboard",
    },
    {
      label: "Обо мне",
      icon: <User className="h-4 w-4" />,
      path: "?tab=about",
    },
    {
      label: "Расписание",
      icon: <Calendar className="h-4 w-4" />,
      path: "?tab=schedule",
    },
    {
      label: "Ученики",
      icon: <Users className="h-4 w-4" />,
      path: "?tab=students",
    },
    {
      label: "Сообщения",
      icon: <MessageSquare className="h-4 w-4" />,
      path: "?tab=chats",
    },
    {
      label: "Материалы",
      icon: <FileText className="h-4 w-4" />,
      path: "?tab=materials",
    },
    {
      label: "Статистика",
      icon: <Clock className="h-4 w-4" />,
      path: "?tab=stats",
    },
    {
      label: "Настройки",
      icon: <Settings className="h-4 w-4" />,
      path: "?tab=settings",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="mt-6 grid grid-cols-1 gap-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={{
              pathname: "/profile/tutor",
              search: item.path,
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted ${
              currentPath.includes(item.path) 
                ? "bg-muted font-medium" 
                : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
