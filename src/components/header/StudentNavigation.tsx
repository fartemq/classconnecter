
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Calendar, Users, Heart, MessageSquare, 
  FileText, Settings, User, Sparkles
} from "lucide-react";

// Student navigation tabs
const studentTabs = [
  { name: "Главная", path: "/profile/student", icon: Home },
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, notificationKey: "messages" },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  { name: "Профиль", path: "/profile/student/edit", icon: User },
];

export const StudentNavigation = () => {
  const location = useLocation();
  
  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    return location.pathname === path || 
           (path !== "/profile/student" && location.pathname.includes(path));
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {studentTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${
            isStudentTabActive(tab.path) 
              ? "text-primary font-medium bg-primary/10 shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          } px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all relative text-xs whitespace-nowrap`}
        >
          <tab.icon className="h-3.5 w-3.5" />
          <span>{tab.name}</span>
        </Link>
      ))}
    </div>
  );
};
