
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart, 
  Settings, 
  Home, 
  FileText
} from "lucide-react";

// Tutor navigation tabs
const tutorTabs = [
  { name: "Главная", path: "/profile/tutor", icon: Home },
  { name: "Информация о преподавании", path: "/profile/tutor?tab=teaching", icon: FileText },
  { name: "Расписание", path: "/profile/tutor?tab=schedule", icon: Calendar },
  { name: "Ученики", path: "/profile/tutor?tab=students", icon: Users },
  { name: "Сообщения", path: "/profile/tutor?tab=chats", icon: MessageSquare },
  { name: "Статистика", path: "/profile/tutor?tab=stats", icon: BarChart },
  { name: "Настройки", path: "/profile/tutor?tab=settings", icon: Settings },
];

export const TutorNavigation = () => {
  const location = useLocation();
  
  // Function to check if a tutor tab is active
  const isTutorTabActive = (path: string) => {
    // For the main dashboard path without query params
    if (path === "/profile/tutor" && location.pathname === "/profile/tutor" && !location.search) {
      return true;
    }
    
    // For paths with query params
    const tabParam = new URLSearchParams(location.search).get("tab");
    const pathTab = new URLSearchParams(new URL(path, window.location.origin).search).get("tab");
    
    if (pathTab) {
      // If the path has a tab parameter, check if it matches the current tab
      return location.pathname === "/profile/tutor" && tabParam === pathTab;
    } else if (path === "/profile/tutor") {
      // For the main dashboard path, it's active if no tab is specified
      return location.pathname === "/profile/tutor" && !tabParam;
    }
    
    return false;
  };

  return (
    <>
      {tutorTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${isTutorTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1.5 transition-colors`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </Link>
      ))}
    </>
  );
};
