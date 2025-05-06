
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Search, Users, 
  MessageSquare, FileText, Settings, 
  User, Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const StudentDashboardButtons = () => {
  const navigate = useNavigate();
  
  // Updated list of buttons with all requested sections
  const studentNavItems = [
    { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
    { name: "Поиск репетиторов", path: "/profile/student/find-tutors", icon: Search },
    { name: "Мои репетиторы", path: "/profile/student/my-tutors", icon: Users },
    { name: "Моя анкета", path: "/profile/student/profile", icon: User },
    { name: "Мой прогресс", path: "/profile/student/progress", icon: Activity },
    { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, badge: 2 },
    { name: "Домашние задания", path: "/profile/student/homework", icon: FileText, badge: 1 },
    { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  ];
  
  return (
    <div className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Личный кабинет ученика</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentNavItems.map((item) => (
          <div 
            key={item.path}
            className="flex flex-col items-center p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all duration-300"
            onClick={() => navigate(item.path)}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 text-primary">
                <item.icon className="h-8 w-8" />
              </div>
              
              {item.badge ? (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {item.badge}
                </Badge>
              ) : null}
            </div>
            <span className="mt-4 font-medium text-gray-800">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
