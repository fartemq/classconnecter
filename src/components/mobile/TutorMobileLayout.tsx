
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, User, Calendar, Users, MessageSquare, 
  BarChart3, Settings, Bell, FileText 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TutorMobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorMobileLayout: React.FC<TutorMobileLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { icon: Home, label: "Главная", href: "/profile/tutor", tab: "dashboard" },
    { icon: User, label: "Анкета", href: "/profile/tutor/profile", tab: "profile" },
    { icon: FileText, label: "Запросы", href: "/profile/tutor/lesson-requests", tab: "lesson-requests" },
    { icon: Bell, label: "Уведомления", href: "/profile/tutor/notifications", tab: "notifications" },
    { icon: Users, label: "Ученики", href: "/profile/tutor/students", tab: "students" },
    { icon: Calendar, label: "Расписание", href: "/profile/tutor/schedule", tab: "schedule" },
    { icon: BarChart3, label: "Аналитика", href: "/profile/tutor/analytics", tab: "analytics" },
    { icon: MessageSquare, label: "Чаты", href: "/profile/tutor/chats", tab: "chats" },
    { icon: Settings, label: "Настройки", href: "/profile/tutor/settings", tab: "settings" },
  ];

  const handleNavigation = (href: string, tab: string) => {
    onTabChange(tab);
    navigate(href);
  };
  
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Mobile Navigation Header */}
        <div className="bg-white border-b p-2 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {navItems.map((item) => (
              <Button
                key={item.tab}
                variant={activeTab === item.tab ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.href, item.tab)}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="px-4 py-4">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // This should not be reached as we handle desktop in parent component
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow">
        <div className="px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
};
