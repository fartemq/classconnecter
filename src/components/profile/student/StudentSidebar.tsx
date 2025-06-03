
import React from "react";
import { 
  Home, 
  User, 
  CalendarDays, 
  Search, 
  Users, 
  LineChart, 
  Settings, 
  MessageSquare,
  BookOpen,
  FileText
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

export const StudentSidebar = () => {
  const { profile } = useProfile("student");
  const location = useLocation();
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Главная",
      href: "/profile/student",
      exact: true
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Моя анкета",
      href: "/profile/student/edit",
    },
    {
      icon: <Search className="h-5 w-5" />,
      label: "Поиск репетиторов",
      href: "/profile/student/find-tutors",
      description: "Найти новых репетиторов"
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Мои репетиторы",
      href: "/profile/student/my-tutors",
      description: "Управление репетиторами"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Запросы на занятия",
      href: "/profile/student/lesson-requests",
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      label: "Расписание",
      href: "/profile/student/schedule",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Домашние задания",
      href: "/profile/student/homework",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Чаты",
      href: "/profile/student/chats",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      label: "Мой прогресс",
      href: "/profile/student/progress",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Настройки",
      href: "/profile/student/settings",
    },
  ];

  if (!profile) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <aside className="w-full h-full flex flex-col bg-white">
      {/* Profile section */}
      <NavLink 
        to="/profile/student/edit" 
        className="p-4 border-b cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
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
            <Badge variant="outline" className="mt-1">Ученик</Badge>
          </div>
        </div>
      </NavLink>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Навигация
        </div>
        <div className="mt-2 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `
                flex items-center px-3 py-2 rounded-md text-sm font-medium
                ${isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}
              `}
              end={item.exact}
              title={item.description}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
