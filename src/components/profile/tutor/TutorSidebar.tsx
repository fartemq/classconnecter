
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "Главная", icon: Home },
  { id: "profile", label: "Моя анкета", icon: User },
  { id: "teaching", label: "Информация о преподавании", icon: FileText },
  { id: "schedule", label: "Расписание", icon: Calendar },
  { id: "students", label: "Ученики", icon: Users },
  { id: "chats", label: "Сообщения", icon: MessageSquare },
  { id: "stats", label: "Статистика", icon: BarChart3 },
  { id: "materials", label: "Материалы", icon: FileText },
  { id: "settings", label: "Настройки", icon: Settings },
];

interface TutorSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TutorSidebar: React.FC<TutorSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="py-2 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start",
              activeTab === item.id ? "bg-gray-100" : ""
            )}
            onClick={() => onTabChange(item.id)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
};
