
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, User, Calendar, Users, MessageSquare, 
  BarChart3, Settings, Bell, FileText 
} from "lucide-react";

interface TutorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorSidebar: React.FC<TutorSidebarProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Главная", href: "/profile/tutor", exact: true },
    { icon: User, label: "Моя анкета", href: "/profile/tutor/profile" },
    { icon: FileText, label: "Запросы на занятия", href: "/profile/tutor/lesson-requests" },
    { icon: Bell, label: "Уведомления", href: "/profile/tutor/notifications" },
    { icon: Users, label: "Мои ученики", href: "/profile/tutor/students" },
    { icon: Calendar, label: "Расписание", href: "/profile/tutor/schedule" },
    { icon: BarChart3, label: "Аналитика", href: "/profile/tutor/analytics" },
    { icon: MessageSquare, label: "Сообщения", href: "/profile/tutor/chats" },
    { icon: Settings, label: "Настройки", href: "/profile/tutor/settings" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
