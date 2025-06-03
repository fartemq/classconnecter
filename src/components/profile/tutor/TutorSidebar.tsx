
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  MessageSquare, 
  Settings, 
  Bell,
  Users,
  BarChart3,
  FileText,
  Edit3,
  Home
} from "lucide-react";

interface TutorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorSidebar = ({ activeTab, onTabChange }: TutorSidebarProps) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Главная",
      icon: Home,
    },
    {
      id: "profile",
      label: "Моя анкета",
      icon: Edit3,
    },
    {
      id: "lesson-requests",
      label: "Запросы на занятия",
      icon: FileText,
    },
    {
      id: "notifications",
      label: "Уведомления",
      icon: Bell,
    },
    {
      id: "students",
      label: "Мои ученики",
      icon: Users,
    },
    {
      id: "schedule",
      label: "Расписание",
      icon: Calendar,
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: BarChart3,
    },
    {
      id: "chats",
      label: "Сообщения",
      icon: MessageSquare,
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Личный кабинет
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
