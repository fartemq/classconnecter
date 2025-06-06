
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  Users, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Bell,
  User
} from "lucide-react";

interface StudentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const StudentSidebar = ({ activeTab, onTabChange }: StudentSidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { id: "dashboard", label: "Главная", icon: Home, path: "/profile/student" },
    { id: "profile", label: "Профиль", icon: User, path: "/profile/student/profile" },
    { id: "find-tutors", label: "Найти репетиторов", icon: Search, path: "/profile/student/find-tutors" },
    { id: "my-tutors", label: "Мои репетиторы", icon: Users, path: "/profile/student/my-tutors" },
    { id: "chats", label: "Сообщения", icon: MessageSquare, path: "/profile/student/chats" },
    { id: "schedule", label: "Расписание", icon: Calendar, path: "/profile/student/schedule" },
    { id: "homework", label: "Домашние задания", icon: BookOpen, path: "/profile/student/homework" },
    { id: "progress", label: "Прогресс", icon: TrendingUp, path: "/profile/student/progress" },
    { id: "lesson-requests", label: "Заявки на уроки", icon: Calendar, path: "/profile/student/lesson-requests" },
    { id: "notifications", label: "Уведомления", icon: Bell, path: "/profile/student/notifications" },
    { id: "settings", label: "Настройки", icon: Settings, path: "/profile/student/settings" }
  ];

  // Определяем активную вкладку на основе текущего URL
  const getActiveTabFromPath = () => {
    const pathParts = location.pathname.split('/');
    
    if (pathParts.includes('chats') && pathParts.length > 4) {
      return "chats"; // Individual chat view
    } else if (pathParts.includes('chats')) {
      return "chats"; // Chat list
    } else if (pathParts.includes('find-tutors')) {
      return "find-tutors";
    } else if (pathParts.includes('my-tutors')) {
      return "my-tutors";
    } else if (pathParts.includes('schedule')) {
      return "schedule";
    } else if (pathParts.includes('homework')) {
      return "homework";
    } else if (pathParts.includes('progress')) {
      return "progress";
    } else if (pathParts.includes('lesson-requests')) {
      return "lesson-requests";
    } else if (pathParts.includes('notifications')) {
      return "notifications";
    } else if (pathParts.includes('settings')) {
      return "settings";
    } else if (pathParts.includes('profile')) {
      return "profile";
    } else {
      return "dashboard";
    }
  };

  const currentActiveTab = getActiveTabFromPath();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800">Личный кабинет</h2>
        <p className="text-sm text-gray-500 mt-1">Ученик</p>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActiveTab === item.id;
            
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
