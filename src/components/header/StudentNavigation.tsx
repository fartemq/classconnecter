
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Heart, MessageSquare, FileText, Settings, User } from "lucide-react";

// Student navigation tabs
const studentTabs = [
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText },
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
