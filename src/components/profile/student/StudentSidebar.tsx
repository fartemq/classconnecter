
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, User, BookOpen, MessageSquare, Settings, Book } from "lucide-react";
import { cn } from "@/lib/utils";

const StudentSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentTab = new URLSearchParams(location.search).get('tab') || '';

  const isActive = (path: string, tab?: string) => {
    if (tab) {
      return currentPath === path && currentTab === tab;
    }
    return currentPath === path;
  };

  const menuItems = [
    { path: "/profile/student", icon: <User className="mr-2 h-5 w-5" />, label: "Профиль" },
    { path: "/profile/student/schedule", icon: <Calendar className="mr-2 h-5 w-5" />, label: "Расписание" },
    { path: "/profile/student/tutors", icon: <BookOpen className="mr-2 h-5 w-5" />, label: "Мои репетиторы" },
    { path: "/profile/student/chats", icon: <MessageSquare className="mr-2 h-5 w-5" />, label: "Сообщения" },
    { path: "/profile/student/materials", icon: <Book className="mr-2 h-5 w-5" />, label: "Учебные материалы" },
    { path: "/profile/student/settings", icon: <Settings className="mr-2 h-5 w-5" />, label: "Настройки" },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-medium text-lg">Навигация</h3>
      </div>
      <nav className="py-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm hover:bg-gray-100 transition-colors",
                  isActive(item.path) ? "text-primary bg-gray-50 font-medium" : "text-gray-700"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default StudentSidebar;
