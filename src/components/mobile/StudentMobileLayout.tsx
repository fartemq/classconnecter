
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, User, CalendarDays, Search, Users, 
  LineChart, Settings, MessageSquare, BookOpen 
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { StudentProfileCard } from "@/components/profile/student/StudentProfileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudentMobileLayoutProps {
  children: React.ReactNode;
  showProfileCard?: boolean;
}

export const StudentMobileLayout: React.FC<StudentMobileLayoutProps> = ({ 
  children, 
  showProfileCard = true 
}) => {
  const { profile } = useProfile("student");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const navItems = [
    { icon: Home, label: "Главная", href: "/profile/student" },
    { icon: User, label: "Анкета", href: "/profile/student/edit" },
    { icon: CalendarDays, label: "Расписание", href: "/profile/student/schedule" },
    { icon: BookOpen, label: "ДЗ", href: "/profile/student/homework" },
    { icon: Search, label: "Поиск", href: "/profile/student/find-tutors" },
    { icon: Users, label: "Репетиторы", href: "/profile/student/my-tutors" },
    { icon: MessageSquare, label: "Чаты", href: "/profile/student/chats" },
    { icon: LineChart, label: "Прогресс", href: "/profile/student/progress" },
    { icon: Settings, label: "Настройки", href: "/profile/student/settings" },
  ];
  
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Mobile Navigation Header */}
        <div className="bg-white border-b p-2 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.href)}
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
