
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart, 
  Settings, 
  Home, 
  FileText,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tutor navigation tabs
const tutorTabs = [
  { name: "Главная", path: "/profile/tutor", icon: Home, id: "dashboard" },
  { name: "Моя анкета", path: "/profile/tutor/profile", icon: User, id: "profile" },
  { name: "Информация о преподавании", path: "/profile/tutor/teaching", icon: FileText, id: "teaching" },
  { name: "Расписание", path: "/profile/tutor/schedule", icon: Calendar, id: "schedule" },
  { name: "Управление учениками", path: "/profile/tutor/students", icon: Users, id: "students" },
  { name: "Сообщения", path: "/profile/tutor/chats", icon: MessageSquare, id: "chats" },
  { name: "Статистика", path: "/profile/tutor/stats", icon: BarChart, id: "stats" },
  { name: "Настройки", path: "/profile/tutor/settings", icon: Settings, id: "settings" },
];

export const TutorNavigation = () => {
  const location = useLocation();
  
  // Function to check if a tab is active based on the current path
  const isTabActive = (path: string) => {
    if (path === "/profile/tutor") {
      return location.pathname === "/profile/tutor";
    }
    return location.pathname === path;
  };

  return (
    <>
      {tutorTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) => 
              cn(
                "flex items-center gap-1.5 transition-colors", 
                isActive || isTabActive(tab.path) 
                  ? "text-primary font-medium" 
                  : "text-gray-700 hover:text-primary"
              )
            }
            end={tab.path === "/profile/tutor"}
          >
            <Icon className="h-4 w-4" />
            {tab.name}
          </NavLink>
        );
      })}
    </>
  );
};
