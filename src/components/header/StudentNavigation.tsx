
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Calendar, Search, Users, Heart, MessageSquare, 
  FileText, Settings, User, Activity, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Student navigation tabs - restored and updated with all requested sections
const studentTabs = [
  { name: "Главная", path: "/profile/student", icon: Home },
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Домашние задания", path: "/profile/student/homework", icon: BookOpen, notificationCount: 1 },
  { name: "Поиск репетиторов", path: "/profile/student/find-tutors", icon: Search },
  { name: "Мои репетиторы", path: "/profile/student/my-tutors", icon: Users },
  { name: "Моя анкета", path: "/profile/student/profile", icon: User },
  { name: "Мой прогресс", path: "/profile/student/progress", icon: Activity },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, notificationCount: 2 },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
];

export const StudentNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    return location.pathname === path;
  };

  const handleTabClick = (path: string) => {
    console.log("StudentNavigation: Navigating to:", path);
    navigate(path);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {studentTabs.map((tab) => (
        <button 
          key={tab.path}
          onClick={() => handleTabClick(tab.path)}
          className={`${
            isStudentTabActive(tab.path) 
              ? "text-primary font-medium bg-primary/10 shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          } px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all relative text-sm whitespace-nowrap cursor-pointer`}
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.name}</span>
          
          {tab.notificationCount && tab.notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {tab.notificationCount}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};
