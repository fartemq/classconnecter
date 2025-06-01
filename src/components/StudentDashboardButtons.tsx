
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Search, Users, 
  MessageSquare, FileText, Settings, 
  User, Activity, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

export const StudentDashboardButtons = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Updated list of buttons with all requested sections
  const studentNavItems = [
    { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
    { name: "Домашние задания", path: "/profile/student/homework", icon: BookOpen, badge: 1 },
    { name: "Поиск репетиторов", path: "/profile/student/find-tutors", icon: Search },
    { name: "Мои репетиторы", path: "/profile/student/my-tutors", icon: Users },
    { name: "Моя анкета", path: "/profile/student/profile", icon: User },
    { name: "Мой прогресс", path: "/profile/student/progress", icon: Activity },
    { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, badge: 2 },
    { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  ];
  
  return (
    <div className={isMobile ? "py-4" : "py-8"}>
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold mb-4 text-center text-gray-800`}>
        Личный кабинет ученика
      </h2>
      
      <div className={`grid ${
        isMobile 
          ? "grid-cols-2 gap-3" 
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      }`}>
        {studentNavItems.map((item) => (
          <div 
            key={item.path}
            className={`flex flex-col items-center ${
              isMobile 
                ? "p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-300" 
                : "p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-300"
            }`}
            onClick={() => navigate(item.path)}
          >
            <div className="relative">
              <div className={`${
                isMobile ? "w-12 h-12" : "w-16 h-16"
              } rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 text-primary`}>
                <item.icon className={`${isMobile ? "h-6 w-6" : "h-8 w-8"}`} />
              </div>
              
              {item.badge ? (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              ) : null}
            </div>
            <span className={`${
              isMobile ? "mt-2 text-sm" : "mt-4"
            } font-medium text-gray-800 text-center`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
