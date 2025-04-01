
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Heart, MessageSquare, FileText, Settings } from "lucide-react";

// Student navigation tabs
const studentTabs = [
  { name: "Расписание", path: "/profile/student?tab=schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student?tab=tutors", icon: Users },
  { name: "Избранное", path: "/profile/student?tab=favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student?tab=chats", icon: MessageSquare },
  { name: "Домашние задания", path: "/profile/student?tab=homework", icon: FileText },
  { name: "Настройки", path: "/profile/student?tab=settings", icon: Settings },
];

export const StudentNavigation = () => {
  const location = useLocation();
  
  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    const pathTab = new URLSearchParams(new URL(path, window.location.origin).search).get("tab");
    
    return location.pathname === "/profile/student" && (tabParam === pathTab || (!tabParam && pathTab === "schedule"));
  };

  return (
    <>
      {studentTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${isStudentTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </Link>
      ))}
    </>
  );
};
