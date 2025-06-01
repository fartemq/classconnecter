
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Home, User, Calendar, Users, MessageSquare, BarChart3, Settings, Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TutorMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorMobileSidebar = ({ isOpen, onClose }: TutorMobileSidebarProps) => {
  const { profile } = useProfile("tutor");
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Дашборд", href: "/profile/tutor", exact: true },
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Меню</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Profile section */}
        {profile && (
          <div className="border-b p-4">
            <Link to="/profile/tutor/profile" onClick={onClose}>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.first_name || ""} />
                  ) : (
                    <AvatarFallback>
                      {getInitials(profile.first_name || "", profile.last_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">
                    {profile.first_name} {profile.last_name}
                  </div>
                  <Badge variant="outline" className="mt-1">Репетитор</Badge>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
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
      </SheetContent>
    </Sheet>
  );
};
