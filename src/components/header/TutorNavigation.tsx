
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

// Tutor navigation tabs
const tutorTabs = [
  { name: "Главная", path: "/profile/tutor", icon: Home, id: "dashboard" },
  { name: "Моя анкета", path: "/profile/tutor?tab=profile", icon: User, id: "profile" },
  { name: "Информация о преподавании", path: "/profile/tutor?tab=teaching", icon: FileText, id: "teaching" },
  { name: "Расписание", path: "/profile/tutor?tab=schedule", icon: Calendar, id: "schedule" },
  { name: "Управление учениками", path: "/profile/tutor?tab=students", icon: Users, id: "students" },
  { name: "Сообщения", path: "/profile/tutor?tab=chats", icon: MessageSquare, id: "chats" },
  { name: "Статистика", path: "/profile/tutor?tab=stats", icon: BarChart, id: "stats" },
  { name: "Настройки", path: "/profile/tutor?tab=settings", icon: Settings, id: "settings" },
];

export const TutorNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to check if a tutor tab is active
  const isTutorTabActive = (tabId: string) => {
    // For the main dashboard path without query params
    if (tabId === "dashboard" && location.pathname === "/profile/tutor" && !location.search) {
      return true;
    }
    
    // For paths with query params
    const tabParam = new URLSearchParams(location.search).get("tab");
    return tabId === tabParam;
  };

  const handleTabClick = (e: React.MouseEvent<HTMLDivElement>, tabId: string) => {
    e.preventDefault();
    console.log(`Navigating to tab: ${tabId}`);
    
    // Use navigate with replace to prevent page reload
    navigate({
      pathname: "/profile/tutor",
      search: tabId === "dashboard" ? "" : `?tab=${tabId}`
    }, { replace: true });
  };

  return (
    <>
      {tutorTabs.map((tab) => (
        <div
          key={tab.id}
          onClick={(e) => handleTabClick(e, tab.id)}
          className={`${isTutorTabActive(tab.id) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </div>
      ))}
    </>
  );
};
