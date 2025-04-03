
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Heart, 
  CalendarClock, 
  MessageSquare, 
  Book, 
  Settings,
  BookOpen
} from "lucide-react";

export const StudentDashboard = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      label: "Расписание занятий",
      icon: CalendarClock,
      path: "/profile/student/schedule",
      className: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      label: "Найти репетитора",
      icon: Search,
      path: "/tutors",
      className: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    },
    {
      label: "Избранные репетиторы",
      icon: Heart,
      path: "/favorites",
      className: "bg-red-50 border-red-200 hover:bg-red-100",
    },
    {
      label: "Сообщения",
      icon: MessageSquare,
      path: "/profile/student/chats",
      className: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      label: "Домашние задания",
      icon: Book,
      path: "/profile/student/homework",
      className: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    },
    {
      label: "Все предметы",
      icon: BookOpen,
      path: "/subjects",
      className: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    },
    {
      label: "Настройки",
      icon: Settings,
      path: "/profile/student/settings",
      className: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Панель управления</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button 
            key={action.label}
            variant="outline" 
            className={`h-auto py-6 px-4 flex flex-col items-center justify-center space-y-3 ${action.className}`} 
            onClick={() => navigate(action.path)}
          >
            <action.icon size={24} />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
