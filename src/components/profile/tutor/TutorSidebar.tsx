
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "Главная", icon: Home, path: "/profile/tutor" },
  { id: "profile", label: "Моя анкета", icon: User, path: "/profile/tutor/profile" },
  { id: "teaching", label: "Информация о преподавании", icon: FileText, path: "/profile/tutor/teaching" },
  { id: "schedule", label: "Расписание", icon: Calendar, path: "/profile/tutor/schedule" },
  { id: "students", label: "Ученики", icon: Users, path: "/profile/tutor/students" },
  { id: "chats", label: "Сообщения", icon: MessageSquare, path: "/profile/tutor/chats" },
  { id: "stats", label: "Статистика", icon: BarChart3, path: "/profile/tutor/stats" },
  { id: "materials", label: "Материалы", icon: FileText, path: "/profile/tutor/materials" },
  { id: "settings", label: "Настройки", icon: Settings, path: "/profile/tutor/settings" },
];

export const TutorSidebar: React.FC = () => {
  return (
    <div className="py-2 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === "/profile/tutor"}
            className={({ isActive }) => 
              cn(
                "flex w-full items-center px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary"
              )
            }
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};
