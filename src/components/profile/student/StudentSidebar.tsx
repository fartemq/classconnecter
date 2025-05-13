
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Calendar, Search, Users, 
  MessageSquare, FileText, Settings, 
  User, Activity, Book
} from "lucide-react";
import { cn } from "@/lib/utils";

export const StudentSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: "/profile/student", icon: <Home className="mr-2 h-5 w-5" />, label: "Главная" },
    { path: "/profile/student/profile", icon: <User className="mr-2 h-5 w-5" />, label: "Моя анкета" },
    { path: "/profile/student/schedule", icon: <Calendar className="mr-2 h-5 w-5" />, label: "Расписание" },
    { path: "/profile/student/find-tutors", icon: <Search className="mr-2 h-5 w-5" />, label: "Поиск репетиторов" },
    { path: "/profile/student/my-tutors", icon: <Users className="mr-2 h-5 w-5" />, label: "Мои репетиторы" },
    { path: "/profile/student/progress", icon: <Activity className="mr-2 h-5 w-5" />, label: "Мой прогресс" },
    { path: "/profile/student/chats", icon: <MessageSquare className="mr-2 h-5 w-5" />, label: "Сообщения" },
    { path: "/profile/student/homework", icon: <FileText className="mr-2 h-5 w-5" />, label: "Домашние задания" },
    { path: "/profile/student/materials", icon: <Book className="mr-2 h-5 w-5" />, label: "Учебные материалы" },
    { path: "/profile/student/settings", icon: <Settings className="mr-2 h-5 w-5" />, label: "Настройки" },
  ];

  const isActive = (path: string) => {
    if (path === "/profile/student") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

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
