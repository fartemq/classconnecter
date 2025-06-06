
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  BookOpen, 
  Activity, 
  Settings,
  Shield,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const AdminSidebar = ({ activeView, onViewChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'documents', label: 'Документы', icon: FileCheck },
    { id: 'chats', label: 'Чаты', icon: MessageSquare },
    { id: 'subjects', label: 'Предметы', icon: BookOpen },
    { id: 'logs', label: 'Логи действий', icon: Activity },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="h-6 w-6 text-red-600" />
          <span className="font-semibold text-gray-900">Админ-панель</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeView === item.id && "bg-red-50 text-red-700 hover:bg-red-100"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
