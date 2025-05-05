
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Calendar, Users, Heart, MessageSquare, 
  FileText, Settings, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Student sidebar navigation items
const sidebarItems = [
  { name: "Главная", path: "/profile/student", icon: Home },
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, badge: 2 },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText, badge: 1 },
  { name: "Мой профиль", path: "/profile/student/edit", icon: User },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
];

export const StudentProfileSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {sidebarItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== "/profile/student" && location.pathname.startsWith(item.path));
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md my-1 text-sm font-medium relative
                      ${isActive 
                        ? "bg-primary text-white" 
                        : "text-gray-700 hover:bg-gray-100"}`}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center p-0"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
};
