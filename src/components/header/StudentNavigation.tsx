
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Heart, MessageSquare, FileText, Settings, User, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Student navigation tabs with notification badges where needed
const studentTabs = [
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, notifications: 2 },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText, notifications: 1 },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  { name: "Мой профиль", path: "/profile/student/edit", icon: User },
];

export const StudentNavigation = () => {
  const location = useLocation();
  
  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex items-center gap-4">
      {studentTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${
            isStudentTabActive(tab.path) 
              ? "text-primary font-medium bg-primary/10 shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          } px-3 py-2 rounded-md flex items-center gap-2 transition-all relative`}
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.name}</span>
          
          {tab.notifications && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {tab.notifications}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
};
