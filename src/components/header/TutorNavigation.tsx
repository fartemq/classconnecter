
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, MessageSquare, BarChart } from "lucide-react";

// Tutor navigation tabs
const tutorTabs = [
  { name: "Расписание", path: "/profile/tutor", icon: Calendar },
  { name: "Ученики", path: "/profile/tutor?tab=students", icon: Users },
  { name: "Сообщения", path: "/profile/tutor?tab=chats", icon: MessageSquare },
  { name: "Статистика", path: "/profile/tutor?tab=stats", icon: BarChart },
];

export const TutorNavigation = () => {
  const location = useLocation();
  
  // Function to check if a tutor tab is active
  const isTutorTabActive = (path: string) => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    const pathTab = new URLSearchParams(new URL(path, window.location.origin).search).get("tab");
    
    return location.pathname === "/profile/tutor" && (tabParam === pathTab || (path === "/profile/tutor" && !tabParam));
  };

  return (
    <>
      {tutorTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${isTutorTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </Link>
      ))}
    </>
  );
};
